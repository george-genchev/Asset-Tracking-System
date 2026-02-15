import "./strategies.css";
import html from "./strategies.html?raw";
import { getCurrentUser, getUserStrategies, deleteStrategy } from "../../lib/supabase.js";

let deleteModal = null;
let strategyToDelete = null;

const page = {
  title: "Strategies | Asset Tracking System",
  render() {
    return html;
  },
  async init() {
    try {
      const { user, error: userError } = await getCurrentUser();
      
      if (userError || !user) {
        console.error("User not authenticated:", userError);
        window.location.hash = "#/login";
        return;
      }

      // Fetch user strategies
      const { data: strategies, error: strategiesError } = await getUserStrategies(user.id);
      
      if (strategiesError) {
        console.error("Error fetching strategies:", strategiesError);
        showError("Failed to load strategies: " + (strategiesError.message || "Unknown error"));
        return;
      }

      // Render strategies list
      renderStrategiesList(strategies || []);

      // Initialize delete modal
      try {
        const modalElement = document.getElementById("deleteModal");
        if (modalElement && typeof bootstrap !== "undefined") {
          deleteModal = new bootstrap.Modal(modalElement);
          const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
          if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener("click", handleDeleteConfirmed);
          }
        }
      } catch (modalError) {
        console.error("Error initializing modal:", modalError);
        // Continue without modal - it's not critical
      }
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
            <tr>
              <td>
                <strong>${escapeHtml(strategy.title)}</strong>
              </td>
              <td>
                <span class="text-muted-strong">${strategy.description ? escapeHtml(strategy.description) : '-'}</span>
              </td>
              <td>
                <span class="text-muted-strong">${formatDate(strategy.created_at)}</span>
              </td>
              <td class="text-center">
                <a href="#/strategies/${strategy.id}" class="btn btn-sm btn-outline-primary" title="View">
                  <i class="bi bi-eye"></i>
                </a>
                <a href="#/strategies/edit/${strategy.id}" class="btn btn-sm btn-outline-warning" title="Edit">
                  <i class="bi bi-pencil"></i>
                </a>
                <button type="button" class="btn btn-sm btn-outline-danger delete-btn" data-id="${strategy.id}" title="Delete">
                  <i class="bi bi-trash"></i>
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
      if (deleteModal) {
        deleteModal.show();
      } else {
        // Fallback: ask for confirmation using browser confirm
        if (confirm("Are you sure you want to delete this strategy?")) {
          deleteStrategy(btn.dataset.id).then(({ error }) => {
            if (error) {
              console.error("Error deleting strategy:", error);
              showError("Failed to delete strategy");
            } else {
              // Reload strategies
              location.hash = "#/strategies";
            }
          });
        }
      }
    });
  });
}

async function handleDeleteConfirmed() {
  if (!strategyToDelete) return;

  try {
    const { error } = await deleteStrategy(strategyToDelete);
    
    if (error) {
      console.error("Error deleting strategy:", error);
      showError("Failed to delete strategy");
      if (deleteModal) {
        deleteModal.hide();
      }
      return;
    }

    if (deleteModal) {
      deleteModal.hide();
    }
    strategyToDelete = null;
    
    // Reload the strategies list
    location.hash = "#/strategies";
  } catch (error) {
    console.error("Error during delete:", error);
    showError("An error occurred while deleting the strategy");
  }
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

export default page;
