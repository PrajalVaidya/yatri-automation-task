const { test, expect } = require("@playwright/test");

test.describe("Customer Module Flow", () => {
  test("Complete customer flow - Login, Navigate, Verify and Fetch Data", async ({
    page,
  }) => {
    // Store all fetched values for final assertion
    const fetchedValues = {
      dashboardValues: {},
      customerData: {},
    };

    console.log("STARTING CUSTOMER MODULE AUTOMATION");

    // Step 1: Login using provided credentials
    console.log("Step 1: Navigating to login page...");
    await page.goto("/");

    console.log("Step 1: Filling login credentials...");
    await page
      .locator('input[type="email"]')
      .fill(process.env.TEST_EMAIL || "test_admin@yopmail.com");
    await page
      .locator('input[type="password"]')
      .fill(process.env.TEST_PASSWORD || "Tester@123456");

    console.log("Step 1: Clicking login button...");
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForLoadState("networkidle");
    console.log("Step 1: Login successful\n");

    // Step 2: Go to customer module
    console.log("Step 2: Navigating to Customer module...");

    // Wait for the page to load and look for customer module link
    await page.waitForTimeout(2000); // Give time for dashboard to load

    // Click on customer from sidebar
    await page.locator("a:has-text('Customer')").click();
    await page.waitForURL("**/customer", { timeout: 5000 });

    console.log("Step 2: Navigated to Customer module\n");

    // Step 3: Verify navigation to customer Overview page
    console.log("Step 3: Verifying Customer Overview page...");
    const currentUrl = await page.url();
    console.log("Current URL:", currentUrl);

    // Check if we're on customer overview page
    const isOnCustomerPage =
      currentUrl.includes("customer") ||
      (await page
        .locator("text=Customer Overview")
        .isVisible({ timeout: 5000 })
        .catch(() => false)) ||
      (await page
        .locator("text=Dashboard")
        .isVisible({ timeout: 5000 })
        .catch(() => false));

    expect(isOnCustomerPage).toBeTruthy();

    console.log("Step 3: Successfully verified Customer Overview page\n");

    // Step 4: Fetch & print all dashboard values
    console.log("Step 4: Fetching all dashboard values...");

    // Wait for dashboard to load
    await page.waitForTimeout(2000);

    // There are 7 cards , Try to extract first 4 dashboard metrics
    try {
      const dashboardCards = await page
        .locator(".rounded-xl.border.bg-card")
        .all();

      if (dashboardCards.length > 0) {
        for (let i = 0; i < dashboardCards.length - 3; i++) {
          const card = dashboardCards[i];
          const cardTitle = await card
            .locator(".text-black2.text-h3")
            .textContent();
          const cardValue = await card
            .locator(".text-h1.text-black")
            .textContent();

          if (card) {
            const key = `Dashboard_Metric_${i + 1}`;
            fetchedValues.dashboardValues[key] = `${cardValue} (${cardTitle})`;
            console.log(`${key}: ${cardValue} (${cardTitle})`);
          }
        }
      }
    } catch (error) {
      console.log("Error fetching dashboard values:", error.message);
    }

    // Extract values from the graph by hovering
    try {
      const ageGroups = ["18-25", "25-33", "33-40"];
      const graphElements = await page.locator(".recharts-rectangle").all();

      for (
        let i = 1;
        i <= Math.min(graphElements.length, ageGroups.length);
        i++
      ) {
        // Now check the graph and hover over elements
        await page.hover(`g:nth-child(${i}) > .recharts-rectangle`, {
          force: true,
        });

        // Wait for tooltip to appear
        await page.waitForTimeout(1000);

        // Extract the value from the hover tooltip
        const tooltipValue = await page
          .locator(".text-h7.tabular-nums.text-muted-foreground")
          .first()
          .textContent();

        if (tooltipValue) {
          const cleanTooltipValue = tooltipValue.trim();
          const ageLabel = ageGroups[i - 1];
          fetchedValues.dashboardValues[`Dashboard_Metric_Age_${ageLabel}`] =
            cleanTooltipValue;
          console.log(
            `Dashboard_Metric_Age_${ageLabel}: ${cleanTooltipValue} (Age ${ageLabel})`
          );
        }
      }
    } catch (error) {
      console.log("Error fetching graph values:", error.message);
    }

    // Extract values from Gender graph
    try {
      const genderGroups = ["Male", "Female", "Other"];

      for (let i = 0; i < genderGroups.length; i++) {
        const genderValue = await page
          .locator(".text-h7.text-black3")
          .nth(i)
          .textContent();
        if (genderValue) {
          const cleanGenderValue = genderValue.trim();
          const genderLabel = genderGroups[i];
          fetchedValues.dashboardValues[
            `Dashboard_Metric_Gender_${genderLabel}`
          ] = cleanGenderValue;
          console.log(
            `Dashboard_Metric_Gender_${genderLabel}: ${cleanGenderValue}`
          );
        }
      }
    } catch (error) {
      console.log("Error fetching gender values:", error.message);
    }

    // Extract values from Location graph
    await page.hover(
      ".p-6.grid.grid-cols-1.md\\:grid-cols-1.lg\\:grid-cols-1 > .rounded-xl > .flex.aspect-video > .recharts-responsive-container > .recharts-wrapper > .recharts-surface > .recharts-layer.recharts-bar > .recharts-layer.recharts-bar-rectangles > g > g:nth-child(3) > .recharts-rectangle",
      { force: true }
    );
    await page.waitForTimeout(1000);

    // Extract the value from the hover tooltip
    const tooltipValue = await page
      .locator(".text-h7.tabular-nums.text-muted-foreground")
      .first()
      .textContent();
    const cleanTooltipValue = tooltipValue.trim();
    fetchedValues.dashboardValues[`Dashboard_Metric_Location_Bagmati`] =
      cleanTooltipValue;
    console.log(`Dashboard_Metric_Location_Bagmati: ${cleanTooltipValue}`);

    // Step 5: Navigate to Customer Lists page
    console.log("Step 5: Navigating to Customer Lists page...");

    await page.getByRole("button", { name: "Customer Lists" }).click();

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log("Step 5: Navigated to Customer Lists page\n");

    // Step 6: Capture & print 1st row customer data
    console.log("Step 6: Capturing first row customer data...");

    try {
      const firstRow = await page.locator("table tbody tr:first-child").first();
      if (await firstRow.isVisible({ timeout: 2000 })) {
        // Get all cells in the first row
        const cells = await firstRow.locator('td, [role="cell"]').all();

        if (cells.length > 0) {
          console.log(`Found ${cells.length} columns in first row:`);

          for (let i = 0; i < cells.length; i++) {
            const cellText = await cells[i].textContent();
            const cleanText = cellText.trim();
            const key = `Column_${i + 1}`;
            fetchedValues.customerData[key] = cleanText;
            console.log(`${key}: ${cleanText}`);
          }
        }
      }
    } catch (e) {
      console.log("Error fetching first row data:", e.message);
    }

    console.log(
      `Step 6: Captured ${
        Object.keys(fetchedValues.customerData).length
      } customer data fields\n`
    );

    // Step 7: Assert all fetched values are not empty
    console.log("Step 7: Asserting all fetched values are not empty...");

    let allValuesValid = true;
    let emptyValues = [];

    // Check dashboard values
    console.log("\nValidating Dashboard Values...");
    for (const [key, value] of Object.entries(fetchedValues.dashboardValues)) {
      const isEmpty = !value || value.trim() === "";

      // Assert that all values are not empty
      expect(isEmpty).toBeFalsy();
      console.log(`${key}: ${value}`);

      if (isEmpty) {
        allValuesValid = false;
        emptyValues.push(`Dashboard.${key}`);
      }
    }

    // Check customer data values
    console.log("\nValidating Customer Data Values...");
    for (const [key, value] of Object.entries(fetchedValues.customerData)) {
      const isEmpty = !value || value.trim() === "";

      // Assert that all values are not empty
      expect(isEmpty).toBeFalsy();
      console.log(`${key}: ${value}`);

      if (isEmpty) {
        allValuesValid = false;
        emptyValues.push(`CustomerData.${key}`);
      }
    }

    console.log("FINAL VALIDATION RESULTS");
    console.log(
      `Total Dashboard Values: ${
        Object.keys(fetchedValues.dashboardValues).length
      }`
    );
    console.log(
      `Total Customer Data Fields: ${
        Object.keys(fetchedValues.customerData).length
      }`
    );
    console.log(`Empty Values Found: ${emptyValues.length}`);

    // Assert that all values are not empty
    expect(
      allValuesValid,
      `Found ${emptyValues.length} empty values: ${emptyValues.join(", ")}`
    ).toBeTruthy();

    console.log("Step 7: All assertions passed!\n");
    console.log("TEST COMPLETED SUCCESSFULLY");
  });
});
