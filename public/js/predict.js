// Function to fetch and insert HTML components
// async function loadComponent(url, containerId) {
//   try {
//     const response = await fetch(url);
//     if (response.ok) {
//       const html = await response.text();
//       document.getElementById(containerId).innerHTML = html;

//       // After loading the form, add event listeners
//       if (containerId === "predict-form-container") {
//         setupFormHandlers();
//       }
//     } else {
//       console.error(`Failed to load component from ${url}`);
//     }
//   } catch (error) {
//     console.error(`Error loading component from ${url}:`, error);
//   }
// }

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

  Predict(formObject);
}

// Function to send prediction request to the backend
async function Predict(data) {
  // Display loading state (optional)

  try {
    const res = await fetch("/predict", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      displayResults(data, json.riskScore);
    } else {
      console.log("error :>> ", "Bad request");
    }
  } catch (error) {
    console.log("error :>>", error.message);
  }
}

// Function to display results
function displayResults(data, riskScore) {
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

  // Update risk factors
  document.getElementById("factor-age").textContent = data.age;
  document.getElementById("factor-hypertension").textContent =
    data.hypertension === "1" ? "Yes" : "No";
  document.getElementById("factor-heart-disease").textContent =
    data.heart_disease === "1" ? "Yes" : "No";
  document.getElementById(
    "factor-glucose"
  ).textContent = `${data.avg_glucose_level} mg/dL`;
  document.getElementById("factor-bmi").textContent = data.bmi;

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

// Function to handle report download (simplified)
function handleDownloadReport() {
  alert("Report download functionality would be implemented here.");
  // In a real implementation, you might generate a PDF or other document format
}

// Export functions for use in other modules if needed
// window.predictController = {
//   init: initPredictPage,
//   loadComponent: loadComponent,
//   handleFormSubmit: handleFormSubmit,
//   simulatePrediction: simulatePrediction,
//   displayResults: displayResults,
//   handleDownloadReport: handleDownloadReport,
// };

// Run initialization when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", setupFormHandlers);
