import crypto from "node:crypto";

const COOKIE = "crza_admin_session";
const MAX_AGE = 60 * 60 * 12;

function env(name) {
  return process.env[name] || "";
}

function sign(payload) {
  return crypto
    .createHmac("sha256", env("ADMIN_SESSION_SECRET"))
    .update(payload)
    .digest("base64url");
}

function makeToken() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + MAX_AGE,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function validToken(token) {
  if (!token || !env("ADMIN_SESSION_SECRET")) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);

  if (signature.length !== expected.length) return false;

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  ) {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return Number(data.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function cookieValue(cookieHeader) {
  const item = (cookieHeader || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(`${COOKIE}=`));

  return item
    ? decodeURIComponent(item.slice(COOKIE.length + 1))
    : "";
}

function setCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(
      token
    )}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`
  );
}

function clearCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );
}

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({
      authenticated: validToken(cookieValue(req.headers.cookie)),
    });
  }

  if (req.method === "DELETE") {
    clearCookie(res);
    return res.status(200).json({ authenticated: false });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  if (
    !env("ADMIN_PASSWORD") ||
    !env("ADMIN_SESSION_SECRET")
  ) {
    return res.status(503).json({
      error:
        "O acesso administrativo ainda não foi configurado na Vercel.",
    });
  }

  const password =
    typeof req.body?.password === "string"
      ? req.body.password
      : "";

  const a = Buffer.from(password);
  const b = Buffer.from(env("ADMIN_PASSWORD"));

  const ok =
    a.length === b.length &&
    crypto.timingSafeEqual(a, b);

  if (!ok) {
    return res.status(401).json({
      error: "Senha incorreta.",
    });
  }

  setCookie(res, makeToken());

  return res.status(200).json({
    authenticated: true,
  });
}
