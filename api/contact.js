function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/json");
  }
  if (typeof res.end === "function") {
    res.end(JSON.stringify(payload));
  }
  return res;
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function validateContactPayload({ name = "", email = "", message = "" }) {
  if (!name.trim()) return "Please share your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
  if (!message.trim()) return "Please tell me what you would like to build together.";
  return "";
}

async function sendContactEmail({ name, email, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || "divvzntx@gmail.com";

  if (!apiKey || !from) {
    return { ok: false, statusCode: 501, error: "Email provider not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `Portfolio inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nWhat would you like to build together?\n${message}`,
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    return {
      ok: false,
      statusCode: 502,
      error: result.message || "Unable to send email right now",
    };
  }

  return { ok: true };
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const body = parseBody(req.body);
  const payload = {
    name: body.name || "",
    email: body.email || "",
    message: body.message || "",
  };

  const validationError = validateContactPayload(payload);
  if (validationError) {
    return json(res, 400, { error: validationError });
  }

  try {
    const result = await sendContactEmail(payload);
    if (!result.ok) {
      return json(res, result.statusCode || 500, { error: result.error || "Unable to send email right now" });
    }

    return json(res, 200, { ok: true });
  } catch {
    return json(res, 500, { error: "Unexpected error sending email" });
  }
}

module.exports = handler;
module.exports.validateContactPayload = validateContactPayload;
module.exports.sendContactEmail = sendContactEmail;
