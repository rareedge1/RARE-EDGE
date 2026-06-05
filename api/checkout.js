export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "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");

    const { plan } = req.body || {};
    const priceId = plan === "annual"
      ? (process.env.STRIPE_PRICE_ANNUAL || "price_1TdwslPfkcBlMM6nyrtzZEvN")
      : (process.env.STRIPE_PRICE_ID    || "price_1TcmdNPfkcBlMM6nqB8opXZU");

    const domain = "https://rare-edge-vlp5.vercel.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${domain}/app?upgraded=true`,
      cancel_url:  `${domain}/app`,
    });

    return res.status(200).json({ url: session.url });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
