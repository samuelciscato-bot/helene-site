import { getStore } from "@netlify/blobs";
import crypto from "crypto";

function verifyToken(token) {
  const storedPassword = Netlify.env.get("DASHBOARD_PASSWORD");
  if (!storedPassword || !token) return false;

  const now = Date.now();
  for (let h = 0; h < 25; h++) {
    const expires = Math.floor((now + h * 60 * 60 * 1000) / (60 * 60 * 1000)) * (60 * 60 * 1000);
    const tokenData = `${expires}:${storedPassword}`;
    const expectedToken = crypto.createHash("sha256").update(tokenData).digest("hex");
    if (token === expectedToken) return true;
  }

  return false;
}

export default async (req, context) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!verifyToken(token)) {
    return Response.json({ error: "Non autorise" }, { status: 401 });
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

    return Response.json({
      totalClicks: Object.values(clickData).reduce((sum, arr) => sum + arr.length, 0),
      buttons: summary,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return new Response("Server error", { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/get-stats"
};
