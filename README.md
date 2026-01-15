# Yatri Automation Task

Automated end-to-end test for the customer module using Playwright.

## What It Does

This test automates a complete customer workflow:

1. **Login** - Authenticates with test credentials
2. **Navigate to Customer Module** - Accesses the customer dashboard
3. **Extract Dashboard Metrics** - Captures 4 key metrics from dashboard cards
4. **Extract Graph Data** - Hovers over charts to capture:
   - Age group distribution (18-25, 25-33, 33-40)
   - Gender breakdown (Male, Female, Other)
   - Location data (Bagmati region)
5. **Navigate to Customer Lists** - Accesses the customer table
6. **Capture Customer Data** - Extracts first row data from the table
7. **Validate All Data** - Asserts that all captured values are non-empty

## Quick Start

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run test (browser visible)
npm run test:headed

# Run test (headless)
npm test
```

## Configuration

The project uses environment variables for configuration. Copy `.env.example` to `.env` and update the values:

```env
BASE_URL=https://p2-admin-dash-qa.vercel.app/
TEST_EMAIL=test_admin@yopmail.com
TEST_PASSWORD=Tester@123456
HEADLESS=false
TIMEOUT=60000
```

**Default values:**

- **Base URL**: `https://p2-admin-dash-qa.vercel.app/`
- **Timeout**: 60 seconds
- **Browser**: Chrome (headed mode by default)

You can also modify `playwright.config.js` for advanced settings.

## Test Output

The test logs detailed information for each step:

- Dashboard metrics (4 cards + 7 graph data points)
- Customer table data (all columns from first row)
- Validation results with pass/fail status

## Troubleshooting

- **Selectors not working?** Update selectors in `tests/customer-flow.spec.js`
- **Timeout errors?** Increase timeout in `playwright.config.js`
- **Login fails?** Verify credentials and base URL

## Features

✅ Comprehensive data extraction  
✅ Interactive graph hover testing  
✅ Automatic validation  
✅ Screenshots & videos on failure  
✅ Detailed console logging
