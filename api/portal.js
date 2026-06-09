import Stripe from "stripe";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });

    // Find customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) {
      return res.status(404).json({ error: "No Stripe customer found for this email." });
    }

    const customerId = customers.data[0].id;

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://arareedge.com/app",
    });

    return res.status(200).json({ url: session.url });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
