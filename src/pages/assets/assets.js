import "./assets.css";
import html from "./assets.html?raw";
import { Modal, Toast } from "bootstrap";
import { getCurrentUser, getAllAssets, deleteAsset } from "../../lib/supabase.js";

let deleteModal = null;
let deleteToast = null;
let assetToDelete = null;

const page = {
  title: "Assets | Asset Tracking System",
  render() {
    return html;
  },
  async init() {
    try {
      deleteModal = null;
      assetToDelete = null;

      const { user, error: userError } = await getCurrentUser();
      
      if (userError || !user) {
        console.error("User not authenticated:", userError);
        window.location.hash = "#/login";
        return;
      }

      // Load assets
      const loaded = await loadAssets(user.id);
      if (!loaded) {
        return;
      }

      // Initialize modal on next tick to ensure DOM is ready
      Promise.resolve().then(() => {
        initializeDeleteModal();
      });
    } catch (error) {
      console.error("Error initializing assets page:", error);
      showError("An error occurred: " + (error.message || "Unknown error"));
    }
  }
};

function renderAssetsList(assets) {
  const container = document.getElementById("assets-list-container");
  
  if (!assets || assets.length === 0) {
    container.innerHTML = `
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <i class="bi bi-inbox display-5 text-muted-strong d-block mb-3"></i>
          <p class="text-muted mb-3">No assets yet</p>
          <a href="#/assets/add" class="btn btn-accent">Create Your First Asset</a>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Ticker</th>
            <th>Name</th>
            <th>Exchange</th>
            <th>Quantity</th>
            <th>Target</th>
            <th>Strategy</th>
            <th>Action</th>
            <th width="150" class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${assets.map(asset => `
            <tr>
              <td>
                <strong>${escapeHtml(asset.ticker)}</strong>
              </td>
              <td>
                <span class="text-muted-strong">${escapeHtml(asset.name) || '-'}</span>
              </td>
              <td>
                <span class="text-muted-strong">${asset.exchanges ? escapeHtml(asset.exchanges.name) : '-'}</span>
              </td>
              <td>
                <span class="text-muted-strong">${asset.quantity || '-'}</span>
              </td>
              <td>
                <span class="text-muted-strong">${asset.targets ? escapeHtml(asset.targets.name) : '-'}</span>
              </td>
              <td>
                <span class="text-muted-strong">${asset.strategies ? escapeHtml(asset.strategies.title) : '-'}</span>
              </td>
              <td>
                <span class="text-muted-strong">${asset.actions ? escapeHtml(asset.actions.name) : '-'}</span>
              </td>
              <td class="text-center">
                <a href="#/assets/${asset.id}" class="btn btn-sm btn-outline-primary" title="View">
                  <i class="bi bi-file-earmark-text-fill"></i>
                </a>
                <a href="#/assets/edit/${asset.id}" class="btn btn-sm btn-outline-warning" title="Edit">
                  <i class="bi bi-gear-fill"></i>
                </a>
                <button type="button" class="btn btn-sm btn-outline-danger delete-btn" data-id="${asset.id}" title="Delete">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Add delete button listeners
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      assetToDelete = btn.dataset.id;
      showDeleteConfirmation();
    });
  });
}

function showDeleteConfirmation() {
  if (!assetToDelete) return;
  
  if (deleteModal) {
    deleteModal.show();
  } else {
    console.error("Modal not initialized");
    showError("Failed to open delete confirmation. Please try again.");
  }
}

async function handleDeleteConfirmed() {
  if (!assetToDelete) return;

  try {
    // Add loading state to button
    const confirmBtn = document.getElementById("confirm-delete-btn");
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Deleting...
      `;
    }

    const { error } = await deleteAsset(assetToDelete);
    
    if (error) {
      console.error("Error deleting asset:", error);
      showError("Failed to delete asset");
      if (deleteModal) {
        deleteModal.hide();
      }
      // Reset button state
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="bi bi-trash-fill me-2"></i>Delete Permanently';
      }
      return;
    }

    // Success - hide modal and refresh the table
    if (deleteModal) {
      deleteModal.hide();
    }
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<i class="bi bi-trash-fill me-2"></i>Delete Permanently';
    }

    const { user } = await getCurrentUser();
    const loaded = await loadAssets(user.id);
    if (!loaded) {
      return;
    }

    // Show success toast notification
    showDeleteSuccessToast();

    assetToDelete = null;
  } catch (error) {
    console.error("Error during delete:", error);
    showError("An error occurred while deleting the asset");
  }
}

function showError(message) {
  const container = document.getElementById("assets-list-container");
  if (container) {
    container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        ${escapeHtml(message)}
      </div>
    `;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function initializeDeleteModal() {
  try {
    const modalElement = document.getElementById("deleteModal");
    if (!modalElement) {
      console.error("Modal element not found");
      return;
    }

    // Create modal instance
    deleteModal = new Modal(modalElement, {
      backdrop: "static",
      keyboard: false
    });

    // Setup delete button listener
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    if (confirmDeleteBtn) {
      confirmDeleteBtn.onclick = handleDeleteConfirmed;
    }

    console.log("Delete modal initialized successfully");
  } catch (error) {
    console.error("Failed to initialize modal:", error);
  }
}

function showDeleteSuccessToast() {
  try {
    const toastElement = document.getElementById("deleteSuccessToast");
    if (!toastElement) {
      console.error("Toast element not found");
      return;
    }

    // Create and show toast
    deleteToast = new Toast(toastElement, {
      autohide: true,
      delay: 3000
    });

    deleteToast.show();

    console.log("Success toast displayed");
  } catch (error) {
    console.error("Failed to show toast:", error);
  }
}

async function loadAssets(userId) {
  const { data: assets, error: assetsError } = await getAllAssets(userId);

  if (assetsError) {
    console.error("Error fetching assets:", assetsError);
    showError("Failed to load assets: " + (assetsError.message || "Unknown error"));
    return false;
  }

  renderAssetsList(assets || []);
  return true;
}

export default page;
