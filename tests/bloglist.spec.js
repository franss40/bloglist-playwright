const { test, expect, beforeEach, describe } = require("@playwright/test")

describe("Blog app", () => {
  beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173")
  })

  test("Login form is shown", async ({ page }) => {
    await expect(
      await page.getByRole('textbox', {name: 'username'})
    ).toBeVisible()
    await expect(
      await page.getByRole("textbox", { name: 'password' })
    ).toBeVisible()
    await expect(
      await page.getByRole("button", { name: 'login' })
    ).toBeVisible()
  })
})
