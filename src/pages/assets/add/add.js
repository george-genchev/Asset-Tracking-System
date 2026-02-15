import "./add.css";
import html from "./add.html?raw";
import { Toast } from "bootstrap";
import { getCurrentUser, getUserStrategies, createAsset, getTargets } from "/src/lib/supabase.js";

let currentUser = null;
let selectedStrategyId = null;
let strategies = [];

const page = {
  title: "Add Asset | Asset Tracking System",
  render() {
    return html;
  },
  async init() {
    try {
      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) {
        window.location.hash = "#/login";
        return;
      }
      currentUser = user;

      // Get strategy ID from query parameter in hash
      const hash = window.location.hash;
      const [, queryString] = hash.split('?');
      const params = new URLSearchParams(queryString || '');
      selectedStrategyId = params.get("strategy");

      // Load strategies and targets to verify ownership
      await loadStrategies();
      await loadTargets();

      // If strategy ID is provided in URL, validate and display it
      if (selectedStrategyId) {
        const strategy = strategies.find(s => s.id === selectedStrategyId);
        if (strategy) {
          document.getElementById("strategyId").value = selectedStrategyId;
          document.getElementById("strategyName").textContent = strategy.title;
          document.getElementById("strategyInfo").classList.remove("hidden");
        }
      }

      // Setup form handlers
      setupFormHandlers();

    } catch (error) {
      console.error("Error initializing page:", error);
    }
  }
};

async function loadStrategies() {
  try {
    const { data, error } = await getUserStrategies(currentUser.id);
    if (error) throw error;
    strategies = data || [];
  } catch (error) {
    console.error("Error loading strategies:", error);
  }
}

async function loadTargets() {
  try {
    const { data, error } = await getTargets();
    if (error) throw error;

    const targetSelect = document.getElementById("target");
    targetSelect.innerHTML = '<option value="">-- Select a Target --</option>';

    if (data && data.length > 0) {
      data.forEach(target => {
        const option = document.createElement("option");
        option.value = target.id;
        option.textContent = target.name;
        targetSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading targets:", error);
  }
}

function setupFormHandlers() {
  const form = document.getElementById("assetForm");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  if (!form) return;

  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    await handleSubmit(form, submitBtn);
  });

  cancelBtn.addEventListener("click", () => {
    window.location.hash = "#/assets";
  });

  // Real-time validation
  form.querySelectorAll(".form-control, .form-select").forEach(field => {
    field.addEventListener("blur", () => {
      if (form.classList.contains("was-validated")) {
        field.classList.toggle("is-invalid", !field.checkValidity());
        field.classList.toggle("is-valid", field.checkValidity());
      }
    });
  });
}

async function handleSubmit(form, submitBtn) {
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  // Validate strategy selection
  const strategyId = document.getElementById("strategyId").value;
  if (!strategyId) {
    alert("Please select or specify a strategy");
    return;
  }

  // Collect form data
  const ticker = document.getElementById("ticker").value.trim();
  const name = document.getElementById("name").value.trim();
  const exchange = document.getElementById("exchange").value.trim();
  const quantity = parseFloat(document.getElementById("quantity").value);
  const targetId = document.getElementById("target").value;

  // Validate data
  if (!ticker || !name || !exchange || quantity <= 0 || !targetId) {
    alert("Please fill in all required fields correctly");
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    // Create asset
    const { data, error } = await createAsset(
      strategyId,
      ticker,
      name,
      exchange,
      quantity,
      targetId
    );

    if (error) throw error;

    if (data) {
      // Show success toast and redirect
      showSuccessToast();
    }

  } catch (error) {
    console.error("Error creating asset:", error);
    alert("Failed to create asset: " + (error.message || "Unknown error"));
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
}

function showSuccessToast() {
  const toastElement = document.getElementById("successToast");
  const toast = new Toast(toastElement, {
    delay: 1500,
    autohide: true
  });

  toast.show();

  // Redirect after toast disappears
  toastElement.addEventListener("hidden.bs.toast", () => {
    // If created from a strategy page, go back to that strategy
    if (selectedStrategyId) {
      window.location.hash = `#/strategies/${selectedStrategyId}`;
    } else {
      // Otherwise go to assets list
      window.location.hash = "#/assets";
    }
  });
}

export default page;

