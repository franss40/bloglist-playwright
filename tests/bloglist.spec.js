const { test, expect, beforeEach, describe } = require("@playwright/test")

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post("http://localhost:3003/api/users", {
      data: {
        name: 'Hellas',
        username: 'Hellas',
        password: 'hellas'
      }
    })
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

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await page.getByRole("textbox", { name: "username" }).fill("Hellas")
      await page.getByRole("textbox", { name: "password" }).fill("hellas")
      await page.getByRole("button", { name: "login" }).click()

      await expect(await page.getByText("Create Blog")).toBeDefined()
      await expect(await page.getByText("blogs")).toBeDefined()

      await expect(await page.getByRole("button", { name: "logout" })).toBeDefined()
    })

    test("fails with wrong credentials", async ({ page }) => {
      await page.getByRole('textbox', { name: 'username' }).fill('Hellas')
      await page.getByRole("textbox", { name: "password" }).fill("eeeellas")
      await page.getByRole("button", { name: "login" }).click()
      
      await expect(await page.getByText("Wrong credentials")).toBeDefined()
    })
  })
})
