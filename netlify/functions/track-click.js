const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const { buttonId, timestamp, page, referrer } = body;

    const allowedIds = [
      "HP-H", "HP-C", "HP-R", "HP-F",
      "MC1-H", "MC1-F", "MC2-H", "MC2-F",
      "MC3-H", "MC3-F", "MC4-H", "MC4-F",
      "MC5-H", "MC5-F"
    ];

    if (!allowedIds.includes(buttonId)) {
      return { statusCode: 400, body: "Invalid button ID" };
    }

    const siteID = process.env.MY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.BLOB_TOKEN;

    const store = getStore({
      name: "clicks",
      siteID: siteID,
      token: token
    });

    let clickData = {};
    try {
      clickData = (await store.get("all-clicks", { type: "json" })) || {};
    } catch (e) {
      clickData = {};
    }

    if (!clickData[buttonId]) {
      clickData[buttonId] = [];
    }

    clickData[buttonId].push({
      timestamp: timestamp || new Date().toISOString(),
      page: page,
      referrer: referrer
    });

    await store.setJSON("all-clicks", clickData);

    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error("Track click error:", error);
    return { statusCode: 500, body: "Server error: " + error.message };
  }
};
