const { test, expect, beforeEach, describe } = require("@playwright/test")
const { loginWith, createBlog } = require("./helper")

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
    await request.post("http://localhost:3003/api/users", {
      data: {
        name: "Fran",
        username: "Fran",
        password: "fran",
      },
    })
    await page.goto("http://localhost:5173")
  })

  test("Login form is shown", async ({ page }) => {
    await expect(page.getByRole('textbox', {name: 'username'})).toBeVisible()
    await expect(page.getByRole("textbox", { name: 'password' })).toBeVisible()
    await expect(page.getByRole("button", { name: 'login' })).toBeVisible()
  })

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await loginWith(page, 'Hellas', 'hellas')

      await expect(page.getByRole("button", { name: "logout" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Create Blog" })).toBeVisible()
      await expect(page.getByText("blogs")).toBeVisible()
    })

    test("fails with wrong credentials", async ({ page }) => {
      await loginWith(page, "Hellas", "eeellas")
      await expect(page.getByText("Wrong credentials")).toBeVisible()
    })
  })

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, "Hellas", "hellas")
      await page.getByRole("button", { name: "Create Blog" }).click()
      await createBlog(page, 'blog title', 'blog author', 'www.url.com')
    })

    test("a new blog can be created", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "blog title" })).toBeVisible()
      await expect(page.getByText("View")).toBeVisible()
    })

    test("a new blog can be edited", async ({ page }) => {
      await page.getByText("View").click()
      await page.getByTestId('buttonLike').click()
      await expect(page.getByTestId("numberLikes")).toHaveText('1')
    })

    test('a blog can be deleted', async({ page }) => {
      await page.getByText("View").click()

      page.once("dialog", (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`)
        dialog.accept().catch(() => {})
      })
      await page.getByRole("button", { name: "Remove" }).click()
      await expect(page.getByRole("heading", { name: "blog title" })).not.toBeVisible()
    })

    test('only the creator can delete the blog', async({ page }) => {
      await page.getByRole("button", { name: "logout" }).click()
      await loginWith(page, "Fran", "fran")

      await page.getByText("View").click()
      await expect(page.getByRole("button", { name: "Remove" })).not.toBeVisible()
    })
  })
})
