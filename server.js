const express = require("express");
const app = express();
const port = 3000;
const request = require("request");

function getStatus() {
  var headers = {
    authority: "www.samsclub.com",
    pragma: "no-cache",
    "cache-control": "no-cache",
    accept: "application/json, text/plain, */*",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    "content-type": "application/json",
    origin: "https://www.samsclub.com",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    referer:
      "https://www.samsclub.com/p/ps5-bundle/prod24980178?xid=plp_product_2",
    "accept-language": "en-US,en;q=0.9",
    cookie:
      "az-reg=scus; SSLB=0; JSESSIONID=AF0B2C89D3FC45EBDFD4B5CAEF5097A7.estoreapp-274179263-30-548829423; samsVisitor=34830162325; samsHubbleSession=AF0B2C89D3FC45EBDFD4B5CAEF5097A7.estoreapp-274179263-30-548829423; prftsl=0; prftdp=0; NSC_JOpzrixvczeodhyemq0tjxew4baq3dc=ffffffff09eb851e45525d5f4f58455e445a4a4216cb; TS0139f7c0=01c5a4e2f95c34034aeab11e1dce169bb31a9b1204f395a885c42526f639cfb8dd2a6fb4dc202951a14f4418a8d23e26618c696e8a; BVImplmain_site=1337; myPreferredFilter=all; myPreferredClub=6444; myNeighboringClubs=6328|6358|6464|6384; myPreferredClubName=Evanston%2C+IL; TS01bc32b7=01538efd7cfa5320ef0a4019c03476fd8a58f5617eb1f3da7fbb586b877dcdf969e721953d348a1d80d66ab1322b8e99c6818a5374; AUTOSELECTCLUB=1; samsorder=835ecae80da0a4aca053acc179c19abd; samsathrvi=RVI~prod24980178; testVersion=versionA; astract=ca-7d0d1128-2b76-46fb-adc7-0922d7cd06d3; AMCVS_B98A1CFE53309C340A490D45%40AdobeOrg=1; AMCV_B98A1CFE53309C340A490D45%40AdobeOrg=-1330315163%7CMCIDTS%7C18609%7CMCMID%7C91612340686160447161189250634596939383%7CMCAID%7CNONE%7CMCOPTOUT-1607748954s%7CNONE; s_cc=true; NSC_JOqyreriep202r0eksinc1efkgrc2cc=0e30a3c6fa5af81e31748443ba5a58edc7c817b45d0f31adbea8d849a7554354ad28a561; TS01f4281b=0130aff23207927d2a5f199c3f982138e0ac2fdf4afe1d54a2222a300829cd2a6ccb17b49fc08c39c277ec8949defa5252ff52a8d2; acstkn=21:4#148479145#7=219225073_1607741838745; rcs=eF4FwbkRgDAMBMDEEb3cjIRkPR3Qhm0REJAB9bPbtvt7riJ2MbCRu3JIUhrMAG7vOnT6jDECrjtDSxIxbCHPXtnFit1_drwRgA; akavpau_P3=1607742644~id=fa64ad43f130a21a6e1fcde79e915058",
  };

  var dataString =
    '{"productIds":["prod24980178"],"type":"LARGE","clubId":6444}';

  var options = {
    url: "https://www.samsclub.com/api/node/vivaldi/v2/az/products",
    method: "POST",
    headers: headers,
    body: dataString,
  };
  return new Promise((resolve) => {
    request(options, (error, response, body) => {
      let available = false;
      if (!error && response.statusCode == 200) {
        available = !body.includes(`"qtyLeft":-1`);
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
