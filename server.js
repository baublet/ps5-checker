const express = require("express");
const app = express();
const port = 3000;
const request = require("request");

function getStatus() {
  var headers = {
    authority: "api.direct.playstation.com",
    pragma: "no-cache",
    "cache-control": "no-cache",
    accept: "*/*",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    "content-type": "application/json",
    origin: "https://direct.playstation.com",
    "sec-fetch-site": "same-site",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    referer: "https://direct.playstation.com/",
    "accept-language": "en-US,en;q=0.9",
  };
  var options = {
    url:
      "https://api.direct.playstation.com/commercewebservices/ps-direct-us/users/anonymous/products/productList?fields=BASIC&productCodes=3005816",
    headers: headers,
  };
  return new Promise((resolve) => {
    request(options, (error, response, body) => {
      let available = false;
      if (!error && response.statusCode == 200) {
        available = !body.includes(`"stockLevelStatus":"outOfStock"`);
      }

      resolve({
        available,
        body,
        error,
      });
    });
  });
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
  const { available, error, body } = await getStatus();
  res.write(`
  <style type="text/css">.hide { display: none }</style>

  ${
    error
      ? "<h2 style='color:yellow'>Unknown (error)</h2>"
      : !available
      ? "<h2 style='color:red'>NO</h2>"
      : "<h2 style='color:green' yes-it-is-available-foolio>YES</h2>"
  }
  <hr />

  <b>Search method:</b> JSON API

<hr />
  <h1>JSON Result</h1>
  <textarea style="width:100%;height:500px">${escapeHTML(body)}</textarea>

<hr />
  <h1>Error</h1>
  <textarea style="width:100%;height:500px">${escapeHTML(
    error || ""
  )}</textarea>

  </body>
  </html>
  
  `);
  res.end();
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
