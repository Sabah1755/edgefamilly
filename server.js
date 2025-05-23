const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(bodyParser.json());

let users = [];

app.post("/register", (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Lütfen tüm alanları doldurun." });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email zaten kayıtlı." });
  }
  users.push({ fullName, email, password });
  res.json({ message: "Kayıt başarılı." });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Geçersiz bilgiler." });
  res.json({ message: "Giriş başarılı." });
});

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount < 100) return res.status(400).json({ error: "Geçerli tutar girin (en az 1 USD)." });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor.`);
});