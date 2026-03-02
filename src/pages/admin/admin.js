import "./admin.css";
import html from "./admin.html?raw";
import { Modal } from "bootstrap";
import {
  createAdminLookupRecord,
  deleteAdminLookupRecord,
  getActions,
  getAdminLookupRecordById,
  getCurrentUser,
  getExchanges,
  getOrders,
  getTargets,
  isCurrentUserAdmin,
  updateAdminLookupRecord
} from "../../lib/supabase.js";

const TABLE_LABELS = {
  actions: "Actions",
  exchanges: "Exchanges",
  orders: "Orders",
  targets: "Targets"
};

let viewModal = null;
let createModal = null;
let editModal = null;
let deleteModal = null;
let recordsByTable = {
  actions: [],
  exchanges: [],
  orders: [],
  targets: []
};

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

  recordsByTable = {
    actions: actionsResult.data || [],
    exchanges: exchangesResult.data || [],
    orders: ordersResult.data || [],
    targets: targetsResult.data || []
  };

  loadingEl.style.display = "none";
  contentEl.style.display = "flex";

  initializeModals();
  bindTableActions();
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
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            data-action="view"
            data-table="${escapeHtml(extractTableName(tableBodyId))}"
            data-id="${record.id}"
          >View</button>
          <button
            type="button"
            class="btn btn-sm btn-outline-warning"
            data-action="edit"
            data-table="${escapeHtml(extractTableName(tableBodyId))}"
            data-id="${record.id}"
          >Edit</button>
          <button
            type="button"
            class="btn btn-sm btn-outline-danger"
            data-action="delete"
            data-table="${escapeHtml(extractTableName(tableBodyId))}"
            data-id="${record.id}"
          >Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function extractTableName(tableBodyId) {
  return tableBodyId.replace("-table-body", "");
}

function initializeModals() {
  if (!viewModal) {
    const viewEl = document.getElementById("adminViewModal");
    if (viewEl) {
      viewModal = new Modal(viewEl);
    }
  }

  if (!editModal) {
    const editEl = document.getElementById("adminEditModal");
    if (editEl) {
      editModal = new Modal(editEl);
    }
  }

  if (!createModal) {
    const createEl = document.getElementById("adminCreateModal");
    if (createEl) {
      createModal = new Modal(createEl);
    }
  }

  if (!deleteModal) {
    const deleteEl = document.getElementById("adminDeleteModal");
    if (deleteEl) {
      deleteModal = new Modal(deleteEl);
    }
  }

  const editSaveBtn = document.getElementById("admin-edit-save-btn");
  if (editSaveBtn && !editSaveBtn.dataset.bound) {
    editSaveBtn.dataset.bound = "true";
    editSaveBtn.addEventListener("click", handleEditSave);
  }

  const createSaveBtn = document.getElementById("admin-create-save-btn");
  if (createSaveBtn && !createSaveBtn.dataset.bound) {
    createSaveBtn.dataset.bound = "true";
    createSaveBtn.addEventListener("click", handleCreateSave);
  }

  const deleteConfirmBtn = document.getElementById("admin-delete-confirm-btn");
  if (deleteConfirmBtn && !deleteConfirmBtn.dataset.bound) {
    deleteConfirmBtn.dataset.bound = "true";
    deleteConfirmBtn.addEventListener("click", handleDeleteConfirm);
  }
}

function bindTableActions() {
  const contentEl = document.getElementById("admin-content");
  if (!contentEl || contentEl.dataset.actionsBound) {
    return;
  }

  contentEl.dataset.actionsBound = "true";
  contentEl.addEventListener("click", async (event) => {
    const createBtn = event.target.closest("[data-create-table]");
    if (createBtn) {
      const table = createBtn.dataset.createTable;
      if (table) {
        openCreateModal(table);
      }
      return;
    }

    const actionBtn = event.target.closest("[data-action][data-table][data-id]");
    if (!actionBtn) {
      return;
    }

    const action = actionBtn.dataset.action;
    const table = actionBtn.dataset.table;
    const id = actionBtn.dataset.id;

    if (!action || !table || !id) {
      return;
    }

    if (action === "view") {
      openViewModal(table, id);
      return;
    }

    if (action === "edit") {
      openEditModal(table, id);
      return;
    }

    if (action === "delete") {
      openDeleteModal(table, id);
    }
  });
}

function openCreateModal(tableName) {
  const tableInput = document.getElementById("admin-create-table");
  const nameInput = document.getElementById("admin-create-name");
  const titleEl = document.getElementById("adminCreateModalTitle");
  const errorEl = document.getElementById("admin-create-error");
  const form = document.getElementById("admin-create-form");

  if (tableInput) tableInput.value = tableName;
  if (nameInput) nameInput.value = "";
  if (titleEl) titleEl.textContent = `Create ${TABLE_LABELS[tableName] || tableName} Record`;
  if (errorEl) {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }
  if (form) {
    form.classList.remove("was-validated");
  }

  createModal?.show();
}

function getRecord(tableName, recordId) {
  return recordsByTable[tableName]?.find((record) => record.id === recordId) || null;
}

function openViewModal(tableName, recordId) {
  const record = getRecord(tableName, recordId);
  if (!record) {
    return;
  }

  const tableEl = document.getElementById("admin-view-table");
  const nameEl = document.getElementById("admin-view-name");
  const createdEl = document.getElementById("admin-view-created");
  const titleEl = document.getElementById("adminViewModalTitle");

  if (tableEl) tableEl.textContent = TABLE_LABELS[tableName] || tableName;
  if (nameEl) nameEl.textContent = record.name || "-";
  if (createdEl) createdEl.textContent = formatDate(record.created_at);
  if (titleEl) titleEl.textContent = `${TABLE_LABELS[tableName] || tableName} Details`;

  viewModal?.show();
}

function openEditModal(tableName, recordId) {
  const record = getRecord(tableName, recordId);
  if (!record) {
    return;
  }

  const tableInput = document.getElementById("admin-edit-table");
  const idInput = document.getElementById("admin-edit-id");
  const nameInput = document.getElementById("admin-edit-name");
  const errorEl = document.getElementById("admin-edit-error");
  const form = document.getElementById("admin-edit-form");

  if (tableInput) tableInput.value = tableName;
  if (idInput) idInput.value = record.id;
  if (nameInput) nameInput.value = record.name || "";
  if (errorEl) {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }
  if (form) {
    form.classList.remove("was-validated");
  }

  editModal?.show();
}

function openDeleteModal(tableName, recordId) {
  const record = getRecord(tableName, recordId);
  if (!record) {
    return;
  }

  const tableInput = document.getElementById("admin-delete-table");
  const idInput = document.getElementById("admin-delete-id");
  const nameEl = document.getElementById("admin-delete-name");
  const errorEl = document.getElementById("admin-delete-error");

  if (tableInput) tableInput.value = tableName;
  if (idInput) idInput.value = record.id;
  if (nameEl) nameEl.textContent = record.name || "this record";
  if (errorEl) {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }

  deleteModal?.show();
}

async function handleEditSave() {
  const form = document.getElementById("admin-edit-form");
  const tableInput = document.getElementById("admin-edit-table");
  const idInput = document.getElementById("admin-edit-id");
  const nameInput = document.getElementById("admin-edit-name");
  const errorEl = document.getElementById("admin-edit-error");
  const saveBtn = document.getElementById("admin-edit-save-btn");

  if (!form || !tableInput || !idInput || !nameInput || !saveBtn) {
    return;
  }

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const tableName = tableInput.value;
  const recordId = idInput.value;
  const nextName = nameInput.value.trim();

  saveBtn.disabled = true;
  if (errorEl) {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }

  const { data: record, error: lookupError } = await getAdminLookupRecordById(tableName, recordId);
  if (lookupError || !record) {
    if (errorEl) {
      errorEl.textContent = lookupError?.message || "Record not found.";
      errorEl.style.display = "block";
    }
    saveBtn.disabled = false;
    return;
  }

  const { error } = await updateAdminLookupRecord(tableName, recordId, nextName);
  if (error) {
    if (errorEl) {
      errorEl.textContent = error.message || "Failed to update record.";
      errorEl.style.display = "block";
    }
    saveBtn.disabled = false;
    return;
  }

  editModal?.hide();
  saveBtn.disabled = false;
  await reloadAdminData();
}

async function handleDeleteConfirm() {
  const tableInput = document.getElementById("admin-delete-table");
  const idInput = document.getElementById("admin-delete-id");
  const errorEl = document.getElementById("admin-delete-error");
  const confirmBtn = document.getElementById("admin-delete-confirm-btn");

  if (!tableInput || !idInput || !confirmBtn) {
    return;
  }

  confirmBtn.disabled = true;
  if (errorEl) {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }

  const { error } = await deleteAdminLookupRecord(tableInput.value, idInput.value);
  if (error) {
    if (errorEl) {
      errorEl.textContent = error.message || "Failed to delete record.";
      errorEl.style.display = "block";
    }
    confirmBtn.disabled = false;
    return;
  }

  deleteModal?.hide();
  confirmBtn.disabled = false;
  await reloadAdminData();
}

async function handleCreateSave() {
  const form = document.getElementById("admin-create-form");
  const tableInput = document.getElementById("admin-create-table");
  const nameInput = document.getElementById("admin-create-name");
  const errorEl = document.getElementById("admin-create-error");
  const saveBtn = document.getElementById("admin-create-save-btn");

  if (!form || !tableInput || !nameInput || !saveBtn) {
    return;
  }

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  saveBtn.disabled = true;
  if (errorEl) {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }

  const { error } = await createAdminLookupRecord(tableInput.value, nameInput.value.trim());
  if (error) {
    if (errorEl) {
      errorEl.textContent = error.message || "Failed to create record.";
      errorEl.style.display = "block";
    }
    saveBtn.disabled = false;
    return;
  }

  createModal?.hide();
  saveBtn.disabled = false;
  await reloadAdminData();
}

async function reloadAdminData() {
  const loadingEl = document.getElementById("admin-loading");
  const contentEl = document.getElementById("admin-content");
  if (loadingEl) {
    loadingEl.style.display = "block";
  }
  if (contentEl) {
    contentEl.style.display = "none";
  }

  await loadAdminData();
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
