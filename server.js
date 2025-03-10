import express, { urlencoded } from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// config secrets from .env
dotenv.config();

// asign dirname to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4400;
const app = express();

// set view engine 'ejs' and set path for templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set path for static files
app.use(express.static(path.join(__dirname, "public")));

// middlewares to parse request's body
app.use(express.json());
app.use(urlencoded({ extended: true }));

// render /
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/predict", (req, res) => {
  res.render("pages/predict");
});

app.get("/about", (req, res) => {
  res.render("pages/about");
});

app.post("/predict", (req, res) => {
  const data = req.body;
  console.log(data);
  res.send({ riskScore: calculateRiskScore(data) });
});

app.listen(PORT, () => console.log(PORT));

const calculateRiskScore = (data) => {
  let riskScore = 0;

  // Parse integers
  data.age = parseInt(data.age);
  data.avg_glucose_level = parseInt(data.avg_glucose_level);
  data.bmi = parseInt(data.bmi);

  console.log(data);
  // Age is a significant factor
  if (data.age > 60) riskScore += 30;
  else if (data.age > 40) riskScore += 15;

  // Hypertension and heart disease
  if (data.hypertension === "1") riskScore += 20;
  if (data.heart_disease === "1") riskScore += 25;

  // Glucose levels
  if (data.avg_glucose_level > 200) riskScore += 20;
  else if (data.avg_glucose_level > 140) riskScore += 10;

  // BMI
  if (data.bmi > 30) riskScore += 15;
  else if (data.bmi > 25) riskScore += 5;

  // Smoking
  if (data.smoking_status === "smokes") riskScore += 20;
  else if (data.smoking_status === "formerly smoked") riskScore += 10;

  // Clamp risk score between 0-100
  riskScore = Math.min(100, Math.max(0, riskScore));
  return riskScore;
};
