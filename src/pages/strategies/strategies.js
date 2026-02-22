import "./strategies.css";
import html from "./strategies.html?raw";
import { Modal, Toast } from "bootstrap";
import { getCurrentUser, getUserStrategies, deleteStrategy } from "../../lib/supabase.js";

let deleteModal = null;
let deleteToast = null;
let strategyToDelete = null;

const page = {
  title: "Strategies | Asset Tracking System",
  render() {
    return html;
  },
  async init() {
    try {
      deleteModal = null;
      strategyToDelete = null;

      const loaded = await loadStrategies();
      if (!loaded) {
        return;
      }

      // Initialize modal on next tick to ensure DOM is ready
      Promise.resolve().then(() => {
        initializeDeleteModal();
      });
    } catch (error) {
      console.error("Error initializing strategies page:", error);
      showError("An error occurred: " + (error.message || "Unknown error"));
    }
  }
};

function renderStrategiesList(strategies) {
  const container = document.getElementById("strategies-list-container");
  
  if (!strategies || strategies.length === 0) {
    container.innerHTML = `
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <i class="bi bi-inbox display-5 text-muted-strong d-block mb-3"></i>
          <p class="text-muted mb-3">No strategies yet</p>
          <a href="#/strategies/add" class="btn btn-accent">Create Your First Strategy</a>
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
            <th>Strategy Name</th>
            <th>Description</th>
            <th>Created</th>
            <th width="150" class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${strategies.map(strategy => `
            <tr class="strategy-row" data-id="${strategy.id}">
              <td>
                <a href="#/strategies/${strategy.id}" class="fw-semibold text-decoration-none" title="View assets in strategy">
                  ${escapeHtml(strategy.title)}
                </a>
              </td>
              <td>
                <span class="text-muted-strong">${strategy.description ? escapeHtml(strategy.description) : '-'}</span>
              </td>
              <td>
                <span class="text-muted-strong">${formatDate(strategy.created_at)}</span>
              </td>
              <td class="text-center">
                <a href="#/strategies/${strategy.id}" class="btn btn-sm btn-outline-primary" title="View">
                  <i class="bi bi-file-earmark-text-fill"></i>
                </a>
                <a href="#/strategies/edit/${strategy.id}" class="btn btn-sm btn-outline-warning" title="Edit">
                  <i class="bi bi-gear-fill"></i>
                </a>
                <button type="button" class="btn btn-sm btn-outline-danger delete-btn" data-id="${strategy.id}" title="Delete">
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
      strategyToDelete = btn.dataset.id;
      showDeleteConfirmation();
    });
  });

  document.querySelectorAll(".strategy-row").forEach(row => {
    row.style.cursor = "pointer";
    row.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) {
        return;
      }

      const strategyId = row.dataset.id;
      if (strategyId) {
        window.location.hash = `#/strategies/${strategyId}`;
      }
    });
  });
}

function showDeleteConfirmation() {
  if (!strategyToDelete) return;
  
  if (deleteModal) {
    deleteModal.show();
  } else {
    console.error("Modal not initialized");
    showError("Failed to open delete confirmation. Please try again.");
  }
}

async function handleDeleteConfirmed() {
  if (!strategyToDelete) return;

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

    const { error } = await deleteStrategy(strategyToDelete);
    
    if (error) {
      console.error("Error deleting strategy:", error);
      showError("Failed to delete strategy");
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

    const loaded = await loadStrategies();
    if (!loaded) {
      return;
    }

    // Show success toast notification
    showDeleteSuccessToast();

    strategyToDelete = null;
  } catch (error) {
    console.error("Error during delete:", error);
    showError("An error occurred while deleting the strategy");
    // Reset button state
    const confirmBtn = document.getElementById("confirm-delete-btn");
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<i class="bi bi-trash-fill me-2"></i>Delete Permanently';
    }
  }
}

async function loadStrategies() {
  const { user, error: userError } = await getCurrentUser();

  if (userError || !user) {
    console.error("User not authenticated:", userError);
    window.location.hash = "#/login";
    return false;
  }

  const { data: strategies, error: strategiesError } = await getUserStrategies(user.id);

  if (strategiesError) {
    console.error("Error fetching strategies:", strategiesError);
    showError("Failed to load strategies: " + (strategiesError.message || "Unknown error"));
    return false;
  }

  renderStrategiesList(strategies || []);
  return true;
}

function showError(message) {
  const container = document.getElementById("strategies-list-container");
  if (container) {
    container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        ${escapeHtml(message)}
      </div>
    `;
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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

export default page;
