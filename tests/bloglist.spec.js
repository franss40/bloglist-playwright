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

    test.only("blogs sorted by likes", async({ page }) => {
      await createBlog(page, "blog title 2", "blog author 2", "www.url2.com")
      await createBlog(page, "blog title 3", "blog author 3", "www.url3.com")
      
      await page.getByRole("heading", { name: "blog title 3 View" }).getByRole("button", { name: "View" }).click()
      await page.getByTestId("blog title 3").getByTestId("buttonLike").click()

      await page.getByRole("heading", { name: "blog title View" }).getByRole("button", { name: "View" }).click()
      await page.getByTestId("blog title").getByTestId('buttonLike').click()
      
      await page.getByRole("heading", { name: "blog title 2 View" }).getByRole("button", { name: "View" }).click()
      await page.getByTestId("blog title").getByTestId("buttonLike").click()

      const views2 = await page.getByRole("heading", { name: 'title' }).all()

      await expect(views2[0]).toHaveText("blog titleHide")
      await expect(views2[1]).toHaveText("blog title 3Hide")
      await expect(views2[2]).toHaveText("blog title 2Hide")
    })
  })
})
