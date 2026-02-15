import "./strategy.css";
import html from "./strategy.html?raw";
import { Modal, Toast } from "bootstrap";
import { getCurrentUser, getStrategyById, getAssetsByStrategy, deleteAsset } from "../../lib/supabase.js";

let strategyId = null;
let deleteModal = null;
let assetToDelete = null;
let assetsData = [];

const page = {
  title: "Strategy | Asset Tracking System",
  render() {
    return html;
  },
  async init() {
    try {
      // Get strategy ID from URL hash
      const hash = window.location.hash;
      const match = hash.match(/#\/strategies\/([^/?]+)/);
      
      if (!match || !match[1]) {
        window.location.hash = "#/dashboard";
        return;
      }

      strategyId = match[1];

      const { user, error: userError } = await getCurrentUser();
      
      if (userError || !user) {
        window.location.hash = "#/login";
        return;
      }

      // Fetch strategy details
      const { data: strategy, error: strategyError } = await getStrategyById(strategyId);
      
      if (strategyError || !strategy) {
        console.error("Error fetching strategy:", strategyError);
        showError("Strategy not found");
        return;
      }

      // Verify ownership
      if (strategy.owner_id !== user.id) {
        showError("You do not have permission to view this strategy");
        return;
      }

      // Fetch assets
      const { data: assets, error: assetsError } = await getAssetsByStrategy(strategyId);
      
      if (assetsError) {
        console.error("Error fetching assets:", assetsError);
        showError("Failed to load assets: " + (assetsError.message || "Unknown error"));
        return;
      }

      // Render strategy details
      assetsData = assets || [];
      renderStrategy(strategy, assetsData);

      // Set up create asset button with strategy ID
      const createAssetBtn = document.getElementById("create-asset-btn");
      if (createAssetBtn) {
        createAssetBtn.href = `#/assets/add?strategy=${strategyId}`;
      }

      // Initialize delete modal
      Promise.resolve().then(() => {
        initializeDeleteModal();
      });
    } catch (error) {
      console.error("Error initializing strategy page:", error);
      showError("An error occurred while loading the strategy");
    }
  }
};

function renderStrategy(strategy, assets) {
  // Update header
  const titleEl = document.getElementById("strategy-title");
  const descEl = document.getElementById("strategy-description");
  const assetCountEl = document.getElementById("strategy-asset-count");
  const createdDateEl = document.getElementById("strategy-created-date");
  const tbody = document.getElementById("assets-tbody");

  if (!titleEl || !descEl || !assetCountEl || !createdDateEl || !tbody) {
    console.error("Missing required DOM elements");
    showError("Page layout error - missing elements");
    return;
  }

  titleEl.textContent = escapeHtml(strategy.title);
  descEl.textContent = strategy.description ? escapeHtml(strategy.description) : "No description provided";
  
  // Update info cards
  assetCountEl.textContent = assets.length;
  const createdDate = new Date(strategy.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  createdDateEl.textContent = createdDate;

  // Render assets table
  if (assets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          No assets added to this strategy yet
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = assets.map((asset, index) => `
    <tr>
      <td>
        <strong>${escapeHtml(asset.ticker)}</strong>
      </td>
      <td>${escapeHtml(asset.name)}</td>
      <td>${escapeHtml(asset.exchange || '-')}</td>
      <td>${asset.quantity}</td>
      <td>
        ${asset.targets ? `<span class="badge bg-info text-dark">${escapeHtml(asset.targets.name)}</span>` : '-'}
      </td>
      <td>
        <div class="d-flex justify-content-between align-items-center">
          <span>${asset.action ? escapeHtml(asset.action) : '-'}</span>
          <div>
            <a href="#/assets/edit/${asset.id}" class="btn btn-sm btn-outline-warning me-2" title="Edit Asset" data-bs-toggle="tooltip">
              <i class="bi bi-pencil-fill"></i>
            </a>
            <button class="btn btn-sm btn-outline-danger delete-asset-btn" data-asset-id="${asset.id}" data-asset-ticker="${escapeHtml(asset.ticker)}" title="Delete Asset" data-bs-toggle="tooltip">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </div>
      </td>
    </tr>
  `).join('');

  // Attach delete button event listeners
  document.querySelectorAll('.delete-asset-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteClick);
  });
}

function showError(message) {
  const section = document.querySelector('.section-panel');
  if (section) {
    section.innerHTML = `
      <div class="alert alert-danger" role="alert">
        ${escapeHtml(message)}
        <br>
        <a href="#/dashboard" class="btn btn-sm btn-outline-danger mt-2">Back to Dashboard</a>
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
  const deleteModalEl = document.getElementById('deleteAssetModal');
  if (deleteModalEl && !deleteModal) {
    deleteModal = new Modal(deleteModalEl, {
      backdrop: 'static',
      keyboard: false
    });

    const confirmBtn = document.getElementById('confirmDeleteAssetBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', handleDeleteConfirmed);
    }
  }
}

function handleDeleteClick(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const assetId = btn.dataset.assetId;
  const assetTicker = btn.dataset.assetTicker;

  assetToDelete = { id: assetId, ticker: assetTicker };

  const modalTitle = document.getElementById('deleteAssetModalTitle');
  const modalDescription = document.getElementById('deleteAssetModalDescription');

  if (modalTitle) {
    modalTitle.textContent = `Delete "${assetTicker}"?`;
  }

  if (modalDescription) {
    modalDescription.textContent = `Are you sure you want to delete this asset? This action cannot be undone.`;
  }

  if (deleteModal) {
    deleteModal.show();
  }
}

async function handleDeleteConfirmed() {
  if (!assetToDelete) return;

  const btn = document.getElementById('confirmDeleteAssetBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';
  }

  try {
    const { error } = await deleteAsset(assetToDelete.id);
    if (error) throw error;

    // Close modal
    if (deleteModal) {
      deleteModal.hide();
    }

    // Remove asset from data
    assetsData = assetsData.filter(a => a.id !== assetToDelete.id);

    // Re-render assets table
    const strategy = { title: document.getElementById('strategy-title').textContent };
    renderStrategy(strategy, assetsData);

    // Attach listeners again
    Promise.resolve().then(() => {
      document.querySelectorAll('.delete-asset-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
      });
    });

    // Show success toast
    showDeleteSuccessToast();

  } catch (error) {
    console.error('Error deleting asset:', error);
    alert('Failed to delete asset: ' + (error.message || 'Unknown error'));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-trash-fill me-2"></i>Delete';
    }
    assetToDelete = null;
  }
}

function showDeleteSuccessToast() {
  const toastEl = document.getElementById('deleteAssetSuccessToast');
  if (toastEl) {
    const toast = new Toast(toastEl);
    toast.show();
  }
}

export default page;
