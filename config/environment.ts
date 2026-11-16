const environmentUrls: Record<string, string> = {
  demo: 'https://opensource-demo.orangehrmlive.com',
};

const selectedEnvironment = process.env.APP_ENV ?? 'demo';
const configuredBaseUrl =
  process.env.ORANGEHRM_BASE_URL ?? environmentUrls[selectedEnvironment];

if (!configuredBaseUrl) {
  throw new Error(
    `Unknown APP_ENV "${selectedEnvironment}". Set ORANGEHRM_BASE_URL or use a supported environment.`,
  );
}

export const environment = {
  name: selectedEnvironment,
  baseURL: configuredBaseUrl.replace(/\/+$/, ''),
  username: process.env.ORANGEHRM_USERNAME ?? 'Admin',
  password: process.env.ORANGEHRM_PASSWORD ?? 'admin123',
};
