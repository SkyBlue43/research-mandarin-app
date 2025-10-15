import { test, expect } from "@playwright/test";

// Example test: open React app home page
test("homepage has expected title", async ({ page }) => {
  // go to your dev server (replace with your app’s URL if needed)
  await page.goto("http://localhost:3000");

  // assert page title
  await expect(page).toHaveTitle("Create Next App");
});
