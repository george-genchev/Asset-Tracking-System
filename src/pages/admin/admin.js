import "./admin.css";
import html from "./admin.html?raw";
import {
  getActions,
  getCurrentUser,
  getExchanges,
  getOrders,
  getTargets,
  isCurrentUserAdmin
} from "../../lib/supabase.js";

const page = {
  title: "Admin Panel | Asset Tracking System",
  render() {
    return html;
  },
  async init() {
    const { user, error: userError } = await getCurrentUser();

    if (userError || !user) {
      window.location.hash = "#/login";
      return;
    }

    const { isAdmin, error: adminError } = await isCurrentUserAdmin();

    if (adminError || !isAdmin) {
      window.location.hash = "#/dashboard";
      return;
    }

    await loadAdminData();
  }
};

async function loadAdminData() {
  const loadingEl = document.getElementById("admin-loading");
  const errorEl = document.getElementById("admin-error");
  const contentEl = document.getElementById("admin-content");

  if (!loadingEl || !errorEl || !contentEl) {
    return;
  }

  errorEl.style.display = "none";

  const [actionsResult, exchangesResult, ordersResult, targetsResult] = await Promise.all([
    getActions(),
    getExchanges(),
    getOrders(),
    getTargets()
  ]);

  const results = [actionsResult, exchangesResult, ordersResult, targetsResult];
  const firstError = results.find((result) => result.error)?.error;

  if (firstError) {
    loadingEl.style.display = "none";
    errorEl.textContent = firstError.message || "Failed to load admin data.";
    errorEl.style.display = "block";
    return;
  }

  renderLookupTable("actions-table-body", actionsResult.data || []);
  renderLookupTable("exchanges-table-body", exchangesResult.data || []);
  renderLookupTable("orders-table-body", ordersResult.data || []);
  renderLookupTable("targets-table-body", targetsResult.data || []);

  loadingEl.style.display = "none";
  contentEl.style.display = "flex";
}

function renderLookupTable(tableBodyId, records) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) {
    return;
  }

  if (!records.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="admin-empty-row py-3">No records</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = records.map((record) => `
    <tr>
      <td>${escapeHtml(record.name || "-")}</td>
      <td>${formatDate(record.created_at)}</td>
      <td class="text-end">
        <div class="admin-table-actions">
          <button type="button" class="btn btn-sm btn-outline-primary">View</button>
          <button type="button" class="btn btn-sm btn-outline-warning">Edit</button>
          <button type="button" class="btn btn-sm btn-outline-danger">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

export default page;
