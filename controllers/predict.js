// Function to fetch and insert HTML components
async function loadComponent(url, containerId) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const html = await response.text();
      document.getElementById(containerId).innerHTML = html;

      // After loading the form, add event listeners
      if (containerId === "predict-form-container") {
        setupFormHandlers();
      }
    } else {
      console.error(`Failed to load component from ${url}`);
    }
  } catch (error) {
    console.error(`Error loading component from ${url}:`, error);
  }
}

// Function to set up form handlers
function setupFormHandlers() {
  const form = document.getElementById("stroke-predict-form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  // Also set up result section buttons
  const newPredictionBtn = document.getElementById("new-prediction");
  if (newPredictionBtn) {
    newPredictionBtn.addEventListener("click", () => {
      document.getElementById("result-section").classList.remove("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const downloadReportBtn = document.getElementById("download-report");
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener("click", handleDownloadReport);
  }
}

// Function to handle form submission
function handleFormSubmit(event) {
  event.preventDefault();

  // Collect form data
  const formData = new FormData(event.target);
  const formObject = Object.fromEntries(formData.entries());

  // In a real implementation, you would send this data to your backend
  // For now, we'll simulate a response and display the result
  getPrediction(formObject);
}

const getPrediction = async (data) => {
  try {
    const res = await fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to get prediction from server");
    }

    const result = await res.json();
    displayResults(data, result);
  } catch (error) {
    console.error("Prediction error:", error);
    alert("There was an error processing your request. Please try again.");
  }
};

// Function to simulate prediction (this would normally be done by the backend)
function simulatePrediction(data) {
  // Display loading state (optional)

  // Simulate API delay
  setTimeout(() => {
    // Calculate a sample risk score based on some factors
    let riskScore = 0;

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

    // Display results
    displayResults(data, riskScore);
  }, 1500);
}

// Function to display results
function displayResults(data, result) {
  // Extract probability from result and convert to percentage
  const riskScore = result.probability * 100;

  // Update the gauge
  const gauge = document.getElementById("risk-gauge");
  gauge.style.width = `${riskScore}%`;

  // Update risk level text
  const riskLevel = document.getElementById("risk-level");
  if (riskScore < 30) {
    riskLevel.textContent = "Low";
    riskLevel.className = "low";
  } else if (riskScore < 60) {
    riskLevel.textContent = "Moderate";
    riskLevel.className = "moderate";
  } else {
    riskLevel.textContent = "High";
    riskLevel.className = "high";
  }

  // Update probability
  document.getElementById(
    "risk-probability"
  ).textContent = `${riskScore.toFixed(1)}%`;

  // Update risk factors based on heart disease prediction inputs
  document.getElementById("factor-age").textContent = data.age;
  document.getElementById("factor-chest-pain").textContent =
    translateChestPainType(data.chest_pain_type);
  document.getElementById(
    "factor-resting-bp"
  ).textContent = `${data.resting_bp_s} mmHg`;
  document.getElementById(
    "factor-cholesterol"
  ).textContent = `${data.cholesterol} mg/dL`;
  document.getElementById("factor-max-hr").textContent = data.max_heart_rate;

  // Show prediction result
  document.getElementById("prediction-result").textContent =
    result.prediction === 1
      ? "Potential heart disease detected"
      : "No heart disease detected";

  // Update date
  const today = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  document.getElementById("result-date").textContent = today.toLocaleDateString(
    "en-US",
    options
  );

  // Show the result section
  const resultSection = document.getElementById("result-section");
  if (resultSection) {
    resultSection.classList.add("active");

    // Scroll to results
    resultSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Helper function to translate chest pain type codes to descriptions
function translateChestPainType(code) {
  const types = {
    1: "Typical angina",
    2: "Atypical angina",
    3: "Non-anginal pain",
    4: "Asymptomatic",
  };
  return types[code] || `Type ${code}`;
}

// Function to handle report download (simplified)
function handleDownloadReport() {
  alert("Report download functionality would be implemented here.");
  // In a real implementation, you might generate a PDF or other document format
}

// Initialize component loading when the page loads
function initPredictPage() {
  loadComponent("/components/Header.html", "header-container");
  loadComponent("/components/PredictForm.html", "predict-form-container");
  loadComponent("/components/DisplayResult.html", "display-result-container");
  loadComponent("/components/Footer.html", "footer-container");
}

// Export functions for use in other modules if needed
window.predictController = {
  init: initPredictPage,
  loadComponent: loadComponent,
  handleFormSubmit: handleFormSubmit,
  simulatePrediction: simulatePrediction,
  displayResults: displayResults,
  handleDownloadReport: handleDownloadReport,
};

// Run initialization when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initPredictPage);
