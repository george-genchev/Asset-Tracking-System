import "./add.css";
import html from "./add.html?raw";
import { Toast } from "bootstrap";
import { getCurrentUser, getUserStrategies, createAsset, getTargets, getActions, getExchanges } from "/src/lib/supabase.js";

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
      await loadActions();
      await loadExchanges();

      // If strategy ID is provided in URL, preselect it
      if (selectedStrategyId) {
        const strategySelect = document.getElementById("strategy");
        if (strategySelect) {
          strategySelect.value = selectedStrategyId;
          updateStrategyInfo(selectedStrategyId);
        }

        const matchingStrategy = strategies.find(strategy => strategy.id === selectedStrategyId);
        toggleStrategySelect(!matchingStrategy);
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

    const strategySelect = document.getElementById("strategy");
    if (strategySelect) {
      strategySelect.innerHTML = '<option value="">-- Select a Strategy --</option>';

      if (strategies.length > 0) {
        strategies.forEach(strategy => {
          const option = document.createElement("option");
          option.value = strategy.id;
          option.textContent = strategy.title;
          strategySelect.appendChild(option);
        });
      }
    }
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

async function loadActions() {
  try {
    const { data, error } = await getActions();
    if (error) throw error;

    const actionSelect = document.getElementById("action");
    actionSelect.innerHTML = '<option value="">-- No Action --</option>';

    if (data && data.length > 0) {
      data.forEach(action => {
        const option = document.createElement("option");
        option.value = action.id;
        option.textContent = action.name;
        actionSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading actions:", error);
  }
}

async function loadExchanges() {
  try {
    const { data, error } = await getExchanges();
    if (error) throw error;

    const exchangeSelect = document.getElementById("exchange");
    exchangeSelect.innerHTML = '<option value="">-- Select an Exchange --</option>';

    if (data && data.length > 0) {
      data.forEach(exchange => {
        const option = document.createElement("option");
        option.value = exchange.id;
        option.textContent = exchange.name;
        exchangeSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading exchanges:", error);
  }
}

function setupFormHandlers() {
  const form = document.getElementById("assetForm");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const strategySelect = document.getElementById("strategy");

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

  if (strategySelect) {
    strategySelect.addEventListener("change", () => {
      updateStrategyInfo(strategySelect.value);
    });
  }

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
  const strategyId = document.getElementById("strategy").value;
  if (!strategyId) {
    alert("Please select or specify a strategy");
    return;
  }

  // Collect form data
  const ticker = document.getElementById("ticker").value.trim();
  const name = document.getElementById("name").value.trim();
  const exchangeId = document.getElementById("exchange").value;
  const quantity = parseFloat(document.getElementById("quantity").value);
  const targetId = document.getElementById("target").value;
  const actionId = document.getElementById("action").value;

  // Validate data
  if (!ticker || !name || !exchangeId || quantity <= 0 || !targetId) {
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
      exchangeId,
      quantity,
      targetId,
      actionId || null
    );

    if (error) throw error;

    if (data) {
      selectedStrategyId = strategyId;
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

function updateStrategyInfo(strategyId) {
  const strategyInfo = document.getElementById("strategyInfo");
  const strategyName = document.getElementById("strategyName");

  if (!strategyInfo || !strategyName) return;

  if (!strategyId) {
    strategyInfo.classList.add("hidden");
    strategyName.textContent = "";
    return;
  }

  const strategy = strategies.find(item => item.id === strategyId);
  if (strategy) {
    strategyName.textContent = strategy.title;
    strategyInfo.classList.remove("hidden");
  } else {
    strategyInfo.classList.add("hidden");
    strategyName.textContent = "";
  }
}

function toggleStrategySelect(show) {
  const strategyGroup = document.getElementById("strategyGroup");
  const strategySelect = document.getElementById("strategy");

  if (!strategyGroup || !strategySelect) return;

  if (show) {
    strategyGroup.classList.remove("hidden");
    strategySelect.disabled = false;
  } else {
    strategyGroup.classList.add("hidden");
    strategySelect.disabled = true;
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

