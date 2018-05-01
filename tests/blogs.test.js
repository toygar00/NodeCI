const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged in", () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("When logged in can see blog create forn", async () => {
    const label = await page.getContentsOf("form label");

    expect(label).toEqual("Blog Title");
  });

  describe("When using valid form inputs", () => {
    beforeEach(async () => {
      await page.type(".title input", "My title");
      await page.type(".content input", "My content");
      await page.click("form button");
    });

    test("Submitting ttakes user to review screen", async () => {
      const text = await page.getContentsOf("h5");

      expect(text).toEqual("Please confirm your entries");
    });

    test("Submitting then saving adds blog to indexpage", async () => {
      await page.click("button.green");
      await page.waitFor(".card");
      const text = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");

      expect(text).toEqual("My title");
      expect(content).toEqual("My content");
    });
  });

  describe("And using invalid inputs", () => {
    beforeEach(async () => {
      await page.click("form button");
    });

    test("When logged in can see blog create forn", async () => {
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe.only("When not logged in", () => {
  const action = [];
  test("Cannot create blogpost", async () => {
    const result = await page.post("/api/blogs", { title: "t", content: "c" });

    expect(result.error).toEqual("You must log in!");
  });

  test("Cannot GET blog list", async () => {
    const result = await page.get("/api/blogs");

    expect(result.error).toEqual("You must log in!");
  });
});
