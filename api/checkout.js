export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { plan } = req.body || {};
    const SECRET = process.env.STRIPE_SECRET_KEY;
    const PRICE  = plan === "annual"
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_ID;

    const domain = "https://arareedge.com";

    const body = new URLSearchParams({
      "payment_method_types[0]": "card",
      "line_items[0][price]": PRICE,
      "line_items[0][quantity]": "1",
      "mode": "subscription",
      "success_url": `${domain}/app?upgraded=true`,
      "cancel_url": `${domain}/app`,
    });

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || "Stripe error" });
    return res.status(200).json({ url: data.url });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
