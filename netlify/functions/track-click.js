import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { buttonId, timestamp, page, referrer } = body;

    const allowedIds = [
      "HP-H", "HP-C", "HP-R", "HP-F",
      "MC1-H", "MC1-F", "MC2-H", "MC2-F",
      "MC3-H", "MC3-F", "MC4-H", "MC4-F",
      "MC5-H", "MC5-F"
    ];

    if (!allowedIds.includes(buttonId)) {
      return new Response("Invalid button ID", { status: 400 });
    }

    const store = getStore("clicks");
    let clickData = await store.get("all-clicks", { type: "json" }) || {};

    if (!clickData[buttonId]) {
      clickData[buttonId] = [];
    }

    clickData[buttonId].push({
      timestamp: timestamp || new Date().toISOString(),
      page: page,
      referrer: referrer
    });

    await store.setJSON("all-clicks", clickData);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Track click error:", error);
    return new Response("Server error", { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/track-click"
};
