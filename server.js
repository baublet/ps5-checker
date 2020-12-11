const express = require("express");
const app = express();
const port = 3000;
const puppeteer = require("puppeteer");

async function getAddToCartButton(page) {
  try {
    const addToCart = await page.waitForSelector(
      `button[data-product-code="3005816"].add-to-cart`,
      {
        timeout: 3000,
      }
    );
    const className = await (
      await addToCart.getProperty("className")
    ).jsonValue();
    return {
      className,
      error: {},
    };
  } catch (e) {
    return {
      className: "NOT FOUND!",
      error: e,
    };
  }
}

async function getPage() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--window-size=1920,1080"],
  });
  const page = await browser.newPage();
  await page.goto(
    "https://direct.playstation.com/en-us/consoles/console/playstation5-console.3005816"
  );

  const { className, error } = await getAddToCartButton(page);

  const pageHtml = await page.evaluate(() => document.body.innerHTML);
  await browser.close();
  return {
    addToCartButtonClassName: className,
    pageHtml,
    error,
  };
}

function escapeHTML(s = "") {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

app.get("/", async (req, res) => {
  res.write(
    `
  <html>
  <head><title>Is the PS5 Available?</title></head>
  <body>

  <h1>Is the PS5 Available?</h1>
  <div class="hide">Loading...</div>
  `
  );
  const { addToCartButtonClassName, pageHtml, error } = await getPage();
  res.write(`
  <style type="text/css">.hide { display: none }</style>

  ${
    `${addToCartButtonClassName}`.includes("hide")
      ? "<h2 style='color:red'>NO</h2>"
      : "<h2 style='color:green' yes-it-is-available-foolio>YES</h2>"
  }

  <br><br>
  <hr />

  <b>Search method:</b> addToCart button classname
  <br><br></b> Value: [${addToCartButtonClassName}]

  <br><br><br><br><hr />
  <h1>Page HTML</h1>
  <textarea style="width:100%;height:500px">${escapeHTML(pageHtml)}</textarea>

  <br><br><br><br><hr />
  <h1>Error</h1>
  <textarea style="width:100%;height:500px">${escapeHTML(
    error.message
  )}\n\n${escapeHTML(error.stack)}</textarea>

  </body>
  </html>
  
  `);
  res.end();
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
