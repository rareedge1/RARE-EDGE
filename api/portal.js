export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) return res.status(500).json({ error: "Stripe not configured" });

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });

    // Find customer by email
    const searchRes = await fetch(
      `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`,
      { headers: { "Authorization": `Bearer ${STRIPE_KEY}` } }
    );
    const searchData = await searchRes.json();
    if (!searchData.data?.length) {
      return res.status(404).json({ error: "No Stripe customer found for this email." });
    }

    const customerId = searchData.data[0].id;

    // Create billing portal session
    const portalRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `customer=${customerId}&return_url=https://arareedge.com/app`
    });
    const portalData = await portalRes.json();

    if (portalData.url) return res.status(200).json({ url: portalData.url });
    return res.status(500).json({ error: portalData.error?.message || "Failed to create portal session" });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
