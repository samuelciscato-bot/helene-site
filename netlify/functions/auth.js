import crypto from "crypto";

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { password } = await req.json();
    const storedPassword = Netlify.env.get("DASHBOARD_PASSWORD");

    if (!storedPassword) {
      return new Response("Server configuration error", { status: 500 });
    }

    if (password === storedPassword) {
      const expires = Date.now() + 24 * 60 * 60 * 1000;
      const tokenData = `${expires}:${storedPassword}`;
      const token = crypto.createHash("sha256").update(tokenData).digest("hex");

      return Response.json({
        success: true,
        token: token,
        expires: expires
      });
    } else {
      return Response.json(
        { success: false, message: "Mot de passe incorrect" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return new Response("Server error", { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/auth"
};
