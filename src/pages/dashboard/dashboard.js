import "./dashboard.css";
import html from "./dashboard.html?raw";
import { getCurrentUser, getUserStrategies, getAssetsByStrategy } from "../../lib/supabase.js";

const page = {
  title: "Dashboard | Asset Tracking System",
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

      // Fetch user strategies
      const { data: strategies, error: strategiesError } = await getUserStrategies(user.id);
      
      if (strategiesError) {
        console.error("Error fetching strategies:", strategiesError);
        showError("Failed to load strategies");
        return;
      }

      // Update summary
      document.getElementById("total-strategies").textContent = strategies?.length || 0;

      // Fetch assets for all strategies
      const strategiesWithAssets = await Promise.all(
        (strategies || []).map(async (strategy) => {
          const { data: assets, error: assetsError } = await getAssetsByStrategy(strategy.id);
          return {
            ...strategy,
            assets: assetsError ? [] : (assets || [])
          };
        })
      );

      // Count total assets
      const totalAssets = strategiesWithAssets.reduce((sum, s) => sum + s.assets.length, 0);
      document.getElementById("total-assets").textContent = totalAssets;

      // Render strategies
      renderStrategies(strategiesWithAssets);
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      showError("An error occurred while loading the dashboard");
    }
  }
};

function renderStrategies(strategies) {
  const container = document.getElementById("strategies-container");
  
  if (!strategies || strategies.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <p class="text-muted mb-3">No strategies yet</p>
            <a href="#/strategies" class="btn btn-accent">Create Your First Strategy</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = strategies.map(strategy => `
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 class="card-title mb-1">
                <a href="#/strategies/${strategy.id}" class="text-decoration-none">${escapeHtml(strategy.title)}</a>
              </h5>
              <p class="text-muted-strong small mb-0">${strategy.assets.length} asset(s)</p>
            </div>
          </div>
          
          ${strategy.description ? `<p class="text-muted-strong text-sm mb-3">${escapeHtml(strategy.description)}</p>` : ''}
          
          <div class="mb-3">
            <h6 class="text-uppercase text-muted-strong small mb-2">Assets</h6>
            ${strategy.assets.length > 0 ? `
              <div class="list-group list-group-sm">
                ${strategy.assets.slice(0, 5).map(asset => `
                  <div class="list-group-item border-0 px-0 py-2">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>${escapeHtml(asset.ticker)}</strong>
                        <span class="text-muted-strong small ms-2">${escapeHtml(asset.name)}</span>
                      </div>
                      <span class="badge bg-light text-dark">${asset.quantity}</span>
                    </div>
                  </div>
                `).join('')}
                ${strategy.assets.length > 5 ? `
                  <div class="list-group-item border-0 px-0 py-2 text-center">
                    <small class="text-muted-strong">+${strategy.assets.length - 5} more</small>
                  </div>
                ` : ''}
              </div>
            ` : `
              <p class="text-muted small">No assets added yet</p>
            `}
          </div>

          <a href="#/strategies/${strategy.id}" class="btn btn-sm btn-outline-primary w-100">
            View Details
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function showError(message) {
  const container = document.getElementById("strategies-container");
  if (container) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          ${escapeHtml(message)}
        </div>
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
