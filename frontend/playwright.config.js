const defaultBaseURL = 'http://localhost:3100';

function normalizeBaseURL(value) {
  if (!value) {
    return defaultBaseURL;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `http://${value}`;
}

const baseURL = normalizeBaseURL(process.env.PLAYWRIGHT_BASE_URL);
const shouldStartLocalWebServer = !process.env.PLAYWRIGHT_BASE_URL;
const localWebServerCommand =
  process.platform === 'win32' ? 'pnpm.cmd dev -p 3100' : 'pnpm dev -p 3100';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: shouldStartLocalWebServer
    ? {
        command: localWebServerCommand,
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
};

module.exports = config;
