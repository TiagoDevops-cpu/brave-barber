import { expect, test } from "@playwright/test";

test("loads the booking entry point", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /agendar/i }).first(),
  ).toBeVisible();
});
