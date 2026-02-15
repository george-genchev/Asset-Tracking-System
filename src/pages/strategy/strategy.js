import "./strategy.css";
import html from "./strategy.html?raw";
import { getCurrentUser, getStrategyById, getAssetsByStrategy } from "../../lib/supabase.js";

let strategyId = null;

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
        showError("Failed to load assets");
        return;
      }

      // Render strategy details
      renderStrategy(strategy, assets || []);
    } catch (error) {
      console.error("Error initializing strategy page:", error);
      showError("An error occurred while loading the strategy");
    }
  }
};

function renderStrategy(strategy, assets) {
  // Update header
  document.getElementById("strategy-title").textContent = escapeHtml(strategy.title);
  document.getElementById("strategy-description").textContent = strategy.description ? escapeHtml(strategy.description) : "No description provided";
  
  // Update info cards
  document.getElementById("strategy-asset-count").textContent = assets.length;
  const createdDate = new Date(strategy.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  document.getElementById("strategy-created-date").textContent = createdDate;

  // Render assets table
  const tbody = document.getElementById("assets-tbody");
  
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
        ${asset.action ? escapeHtml(asset.action) : '-'}
      </td>
    </tr>
  `).join('');
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

export default page;
