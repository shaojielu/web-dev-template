from fastapi import APIRouter, Depends, HTTPException, status
from pydantic.networks import EmailStr
from sqlalchemy import text

from app.api.deps import SessionDep, get_current_active_superuser
from app.schemas.users import Message
from app.utils.utils import generate_test_email, send_email

router = APIRouter(prefix="/utils", tags=["utils"])


@router.get("/health-check/")
async def health_check(session: SessionDep) -> bool:
    await session.execute(text("SELECT 1"))
    return True


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=status.HTTP_201_CREATED,
)
def test_email(email_to: EmailStr) -> Message:
    """Send test email."""
    email_data = generate_test_email(email_to=email_to)
    try:
        send_email(
            email_to=email_to,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    return Message(message="Test email sent")
