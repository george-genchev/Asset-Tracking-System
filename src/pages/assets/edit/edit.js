import "./edit.css";
import html from "./edit.html?raw";
import { Toast } from "bootstrap";
import { getCurrentUser, getAssetById, updateAsset, getTargets, getActions } from "/src/lib/supabase.js";

let currentUser = null;
let currentAsset = null;

const page = {
  title: " Edit Asset | Asset Tracking System",
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

      // Get asset ID from URL hash
      const assetId = getAssetIdFromUrl();
      if (!assetId) {
        window.location.hash = "#/assets";
        return;
      }

      // Load asset data
      await loadAsset(assetId);
      await loadTargets();
      await loadActions();

      if (currentAsset) {
        populateForm();
        document.getElementById("assetForm").style.display = "block";
        document.getElementById("loadingMessage").style.display = "none";
        setupFormHandlers();
      }

    } catch (error) {
      console.error("Error initializing page:", error);
    }
  }
};

function getAssetIdFromUrl() {
  const hash = window.location.hash;
  // Extract path part without query string
  const pathPart = hash.split('?')[0];
  const match = pathPart.match(/#\/assets\/edit\/(.+)$/);
  return match ? match[1] : null;
}

async function loadAsset(assetId) {
  try {
    const { data, error } = await getAssetById(assetId);
    if (error) throw error;

    if (!data) {
      alert("Asset not found");
      window.location.hash = "#/assets";
      return;
    }

    // Verify ownership
    if (data.strategies && data.strategies.owner_id !== currentUser.id) {
      alert("You don't have permission to edit this asset");
      window.location.hash = "#/assets";
      return;
    }

    currentAsset = data;
  } catch (error) {
    console.error("Error loading asset:", error);
    alert("Failed to load asset details");
    window.location.hash = "#/assets";
  }
}

function populateForm() {
  if (!currentAsset) return;

  document.getElementById("assetId").value = currentAsset.id;
  document.getElementById("strategyId").value = currentAsset.strategy_id;
  document.getElementById("ticker").value = currentAsset.ticker || "";
  document.getElementById("name").value = currentAsset.name || "";
  document.getElementById("exchange").value = currentAsset.exchange || "";
  document.getElementById("quantity").value = currentAsset.quantity || "";
  document.getElementById("action").value = currentAsset.action_id || "";

  // Set target
  document.getElementById("target").value = currentAsset.target_id || "";

  // Display strategy info
  if (currentAsset.strategies) {
    document.getElementById("strategyName").textContent = currentAsset.strategies.title;
    document.getElementById("strategyInfo").style.display = "flex";
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

  // Collect form data
  const assetId = document.getElementById("assetId").value;
  const ticker = document.getElementById("ticker").value.trim();
  const name = document.getElementById("name").value.trim();
  const exchange = document.getElementById("exchange").value.trim();
  const quantity = parseFloat(document.getElementById("quantity").value);
  const targetId = document.getElementById("target").value;
  const actionId = document.getElementById("action").value;

  // Validate data
  if (!ticker || !name || !exchange || quantity <= 0 || !targetId) {
    alert("Please fill in all required fields correctly");
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    // Update asset
    const { error } = await updateAsset(assetId, {
      ticker,
      name,
      exchange,
      quantity,
      target_id: targetId,
      action_id: actionId || null
    });

    if (error) throw error;

    // Show success toast and redirect
    showSuccessToast();

  } catch (error) {
    console.error("Error updating asset:", error);
    alert("Failed to update asset: " + (error.message || "Unknown error"));
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
    // Go back to the asset's strategy page
    if (currentAsset && currentAsset.strategy_id) {
      window.location.hash = `#/strategies/${currentAsset.strategy_id}`;
    } else {
      // Fallback to assets list
      window.location.hash = "#/assets";
    }
  });
}

export default page;

