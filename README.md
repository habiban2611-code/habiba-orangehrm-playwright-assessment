# OrangeHRM Playwright Assessment

Playwright tests for the public OrangeHRM demo, implemented in TypeScript with
independent tests and page objects. Project author: **Habiba**.

## Coverage

### Part 1: functional coverage

- Valid login, successful dashboard rendering, PIM navigation, employee list
  rendering, and logout.
- Invalid credentials display the login error and do not grant protected-page
  access.
- Employee list data and its key columns render.

### Part 2: edge cases

The employee search workflow is used to cover search and service-failure cases.

| Scenario | Expected behavior | Automated status |
|---|---|---|
| Search for an employee ID that does not exist | Return no matching employee rows | Implemented in `tests/part2.spec.ts` |
| Reset after an empty search | Clear the filter and restore employee results | Implemented in `tests/part2.spec.ts` |
| Employee-list API returns HTTP 503 | Keep the user on the employee page and display an error notification instead of crashing | Implemented with `page.route()` in `tests/part2.spec.ts` |
| Directly open the protected employee-list URL after an unauthenticated/failed login | Redirect to login and do not expose employee data | Implemented in `tests/part1.spec.ts` |

## Architecture

- `pages/` holds page objects and shared page interactions.
- `tests/part1.spec.ts` contains the core functional scenarios.
- `tests/part2.spec.ts` contains search edge cases and mocked network failure.
- `config/environment.ts` resolves environment URLs and credentials from
  environment variables.
- `playwright.config.ts` centralizes browser, parallelism, retries, reporting,
  and artifact policy.

Tests use isolated Playwright browser contexts and do not create or modify
employees, so they can run concurrently without shared test data. Locators
prefer roles, placeholders, and visible text; the Employee Id field uses its
visible form-group label because the demo page does not consistently associate
that label with the input in the accessibility tree.

## Requirements

- Node.js 22 or later
- npm
- Chromium (installed through Playwright)

## Setup

```bash
npm ci
npx playwright install chromium
```

The public demo environment is the default. Credentials can be overridden with
`ORANGEHRM_USERNAME` and `ORANGEHRM_PASSWORD`. Copy `.env.example` as a reference
if configuring environment variables locally; `.env` is intentionally ignored
by Git.

## Environment configuration

`APP_ENV` selects a named environment in `config/environment.ts`; `demo` is
configured by default. `ORANGEHRM_BASE_URL` can override the URL for another
provisioned OrangeHRM environment without code changes. Set both variables in
the shell or CI environment before running tests. Unknown environment names
without a URL override fail fast with a clear configuration error.

Example in PowerShell:

```powershell
$env:APP_ENV = "demo"
$env:ORANGEHRM_BASE_URL = "https://opensource-demo.orangehrmlive.com"
npm test
```

## Playwright configuration

- `fullyParallel: true` allows isolated specs to run concurrently.
- Local runs use Playwright's default worker count; CI uses two workers to
  balance parallel speed against load on the shared public demo.
- Retries are disabled locally and set to two in CI; `forbidOnly` is enabled in
  CI to prevent accidentally shipping focused-only test runs.
- The HTML reporter is written to `test-results/report`.
- Screenshots, videos, and traces are retained on test failure; successful runs
  do not retain bulky media artifacts.
- GitHub Actions installs Chromium, type-checks, runs the suite, and uploads
  reports and test artifacts even when tests fail.

## Run tests

```bash
npm test
npm run test:part1
npm run test:part2
npm run test:headed
npm run typecheck
npm run test:report
```

## Diagnostics

The HTML report contains test outcomes, step details, and links to failure
artifacts. Playwright captures a screenshot, video, and trace for failed tests.
The network-failure test intercepts the employee-list API with `page.route()`
and returns HTTP 503, making the error state deterministic without relying on
an actual service outage. CI uploads both the report and per-test artifacts.

## Known limitations and workarounds

- The public demo is shared, may be rate-limited, and can change or become
  unavailable. Retries are enabled only in CI; rerun a transient failure and
  inspect its trace before treating it as a product defect.
- Credentials and employee data are controlled by the demo provider. Use the
  `ORANGEHRM_*` variables to point to a separately provisioned test instance.
- The demo UI is not perfectly consistent in exposing form labels
  accessibly, so the Employee Id locator scopes to the visible label group
  rather than relying on a positional selector or XPath.
- Tests depend on Chromium and the current OrangeHRM page labels. Update the
  page objects if the demo navigation or labels change.

## Submission

This folder is the standalone project root. Add a GitHub remote and publish it
under Habiba's account when her repository URL and preferred Git identity are
available. Do not commit credentials or local `.env` files.
