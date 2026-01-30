const { getStore } = require("@netlify/blobs");
const crypto = require("crypto");

function verifyToken(token) {
  const storedPassword = process.env.DASHBOARD_PASSWORD;
  if (!storedPassword || !token) return false;

  const now = Date.now();
  const oneHourMs = 60 * 60 * 1000;

  for (let h = 0; h < 25; h++) {
    const expires = Math.floor((now + h * oneHourMs) / oneHourMs) * oneHourMs;
    const tokenData = `${expires}:${storedPassword}`;
    const expectedToken = crypto.createHash("sha256").update(tokenData).digest("hex");
    if (token === expectedToken) return true;
  }

  return false;
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!verifyToken(token)) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Non autorise" })
    };
  }

  try {
    const store = getStore("clicks");
    const clickData = (await store.get("all-clicks", { type: "json" })) || {};

    const buttonLabels = {
      "HP-H": "Accueil - Header",
      "HP-C": "Accueil - Hero (contenu)",
      "HP-R": "Accueil - Section RDV",
      "HP-F": "Accueil - Footer",
      "MC1-H": "Souffrance au travail - Header",
      "MC1-F": "Souffrance au travail - Footer",
      "MC2-H": "Difficultes relationnelles - Header",
      "MC2-F": "Difficultes relationnelles - Footer",
      "MC3-H": "Troubles emotionnels - Header",
      "MC3-F": "Troubles emotionnels - Footer",
      "MC4-H": "Quete de sens - Header",
      "MC4-F": "Quete de sens - Footer",
      "MC5-H": "Apprendre a mieux se connaitre - Header",
      "MC5-F": "Apprendre a mieux se connaitre - Footer"
    };

    const summary = {};

    for (const [buttonId, clicks] of Object.entries(clickData)) {
      summary[buttonId] = {
        label: buttonLabels[buttonId] || buttonId,
        count: clicks.length,
        clicks: clicks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      };
    }

    for (const [id, label] of Object.entries(buttonLabels)) {
      if (!summary[id]) {
        summary[id] = { label, count: 0, clicks: [] };
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalClicks: Object.values(clickData).reduce((sum, arr) => sum + arr.length, 0),
        buttons: summary,
        lastUpdated: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error("Get stats error:", error);
    return { statusCode: 500, body: "Server error" };
  }
};
