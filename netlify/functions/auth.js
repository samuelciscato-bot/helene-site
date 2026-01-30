const crypto = require("crypto");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { password } = JSON.parse(event.body);
    const storedPassword = process.env.DASHBOARD_PASSWORD;

    if (!storedPassword) {
      return { statusCode: 500, body: "Server configuration error" };
    }

    if (password === storedPassword) {
      const oneHourMs = 60 * 60 * 1000;
      const expires = Math.floor((Date.now() + 24 * oneHourMs) / oneHourMs) * oneHourMs;
      const tokenData = `${expires}:${storedPassword}`;
      const token = crypto.createHash("sha256").update(tokenData).digest("hex");

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true, token, expires })
      };
    } else {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, message: "Mot de passe incorrect" })
      };
    }
  } catch (error) {
    console.error("Auth error:", error);
    return { statusCode: 500, body: "Server error" };
  }
};
