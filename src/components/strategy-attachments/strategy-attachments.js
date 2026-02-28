import "./strategy-attachments.css";
import {
  deleteStrategyAttachment,
  getStrategyAttachments,
  getStrategyAttachmentSignedUrl,
  removeStrategyAttachmentFile,
  uploadStrategyAttachment,
  createStrategyAttachment
} from "../../lib/supabase.js";

export function createStrategyAttachmentEditor(options) {
  return new StrategyAttachmentEditor(options);
}

class StrategyAttachmentEditor {
  constructor({ strategyId, containerId, inputId, listId, emptyId, errorId, countId }) {
    this.strategyId = strategyId;
    this.container = document.getElementById(containerId);
    this.fileInput = document.getElementById(inputId);
    this.listElement = document.getElementById(listId);
    this.emptyElement = document.getElementById(emptyId);
    this.errorElement = document.getElementById(errorId);
    this.countElement = document.getElementById(countId);

    this.existingAttachments = [];
    this.newAttachments = [];
    this.removedExistingIds = new Set();
  }

  async init() {
    if (!this.container || !this.fileInput || !this.listElement || !this.emptyElement || !this.errorElement) {
      return;
    }

    this.bindEvents();
    await this.loadExistingAttachments();
    this.render();
  }

  bindEvents() {
    this.fileInput.addEventListener("change", (event) => {
      this.appendNewFiles(event.target.files || []);
      this.fileInput.value = "";
      this.render();
    });

    this.listElement.addEventListener("click", (event) => {
      const removeBtn = event.target.closest("[data-remove-key]");
      if (!removeBtn) {
        return;
      }

      const removeKey = removeBtn.dataset.removeKey;
      if (!removeKey) {
        return;
      }

      if (removeKey.startsWith("existing:")) {
        const attachmentId = removeKey.replace("existing:", "");
        this.toggleExistingRemoval(attachmentId);
      } else if (removeKey.startsWith("new:")) {
        const newKey = removeKey.replace("new:", "");
        this.removeNewAttachment(newKey);
      }

      this.render();
    });
  }

  appendNewFiles(fileList) {
    const files = Array.from(fileList);

    for (const file of files) {
      const key = `new-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const previewUrl = isImage(file) ? URL.createObjectURL(file) : null;

      this.newAttachments.push({
        key,
        file,
        previewUrl,
        removed: false
      });
    }
  }

  removeNewAttachment(key) {
    const target = this.newAttachments.find((item) => item.key === key);
    if (!target) {
      return;
    }

    if (target.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }

    this.newAttachments = this.newAttachments.filter((item) => item.key !== key);
  }

  toggleExistingRemoval(attachmentId) {
    if (this.removedExistingIds.has(attachmentId)) {
      this.removedExistingIds.delete(attachmentId);
      return;
    }

    this.removedExistingIds.add(attachmentId);
  }

  async loadExistingAttachments() {
    const { data, error } = await getStrategyAttachments(this.strategyId);

    if (error) {
      this.showError(error.message || "Failed to load attachments");
      return;
    }

    this.existingAttachments = await Promise.all(
      (data || []).map(async (attachment) => ({
        ...attachment,
        previewUrl: await this.resolvePreviewUrl(attachment)
      }))
    );
  }

  async resolvePreviewUrl(attachment) {
    if (!attachment?.file_path || !isImageByMimeType(attachment.mime_type, attachment.file_name)) {
      return null;
    }

    const { data, error } = await getStrategyAttachmentSignedUrl(attachment.file_path);
    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  }

  render() {
    if (!this.listElement) {
      return;
    }

    const existingItems = this.existingAttachments.map((attachment) => {
      const markedForRemoval = this.removedExistingIds.has(attachment.id);
      return this.renderAttachmentItem({
        key: `existing:${attachment.id}`,
        name: attachment.file_name,
        size: attachment.file_size,
        mimeType: attachment.mime_type,
        previewUrl: attachment.previewUrl,
        markedForRemoval,
        statusText: markedForRemoval ? "Will be removed after Save Changes" : "Already uploaded",
        statusClass: markedForRemoval ? "text-danger" : "text-success"
      });
    });

    const newItems = this.newAttachments.map((attachment) =>
      this.renderAttachmentItem({
        key: `new:${attachment.key}`,
        name: attachment.file.name,
        size: attachment.file.size,
        mimeType: attachment.file.type,
        previewUrl: attachment.previewUrl,
        markedForRemoval: false,
        statusText: "Will be uploaded after Save Changes",
        statusClass: "text-primary"
      })
    );

    const allItems = [...existingItems, ...newItems];

    this.listElement.innerHTML = allItems.join("");
    this.emptyElement.style.display = allItems.length ? "none" : "block";

    if (this.countElement) {
      this.countElement.textContent = String(
        this.existingAttachments.filter((item) => !this.removedExistingIds.has(item.id)).length + this.newAttachments.length
      );
    }
  }

  renderAttachmentItem({ key, name, size, mimeType, previewUrl, markedForRemoval, statusText, statusClass }) {
    const iconClass = getFileIconClass(mimeType, name);
    const escapedName = escapeHtml(name || "Attachment");
    const preview = previewUrl
      ? `<img src="${previewUrl}" alt="${escapedName}" />`
      : `<i class="bi ${iconClass}" aria-hidden="true"></i>`;

    return `
      <li class="attachment-item d-flex align-items-start justify-content-between gap-3 ${markedForRemoval ? "opacity-50" : ""}">
        <div class="d-flex align-items-center gap-3 attachment-meta flex-grow-1">
          <div class="attachment-preview">${preview}</div>
          <div class="attachment-meta">
            <p class="attachment-name" title="${escapedName}">${escapedName}</p>
            <p class="attachment-size">${formatBytes(size)}</p>
            <span class="attachment-status ${statusClass}">${statusText}</span>
          </div>
        </div>
        <button type="button" class="btn btn-sm ${markedForRemoval ? "btn-outline-secondary" : "btn-outline-danger"} attachment-remove-btn" data-remove-key="${key}">
          ${markedForRemoval ? "Undo" : "Remove"}
        </button>
      </li>
    `;
  }

  async commitChanges() {
    this.clearError();

    const attachmentsToDelete = this.existingAttachments.filter((item) => this.removedExistingIds.has(item.id));

    for (const attachment of this.newAttachments) {
      const { path, error: uploadError } = await uploadStrategyAttachment(this.strategyId, attachment.file);
      if (uploadError || !path) {
        throw new Error(uploadError?.message || `Failed to upload ${attachment.file.name}`);
      }

      const { error: createError } = await createStrategyAttachment({
        strategy_id: this.strategyId,
        file_name: attachment.file.name,
        file_path: path,
        mime_type: attachment.file.type || null,
        file_size: attachment.file.size
      });

      if (createError) {
        await removeStrategyAttachmentFile(path);
        throw new Error(createError.message || `Failed to save metadata for ${attachment.file.name}`);
      }
    }

    for (const attachment of attachmentsToDelete) {
      const { error: storageDeleteError } = await removeStrategyAttachmentFile(attachment.file_path);
      if (storageDeleteError) {
        throw new Error(storageDeleteError.message || `Failed to remove ${attachment.file_name}`);
      }

      const { error: deleteError } = await deleteStrategyAttachment(attachment.id);
      if (deleteError) {
        throw new Error(deleteError.message || `Failed to remove metadata for ${attachment.file_name}`);
      }
    }
  }

  showError(message) {
    if (!this.errorElement) {
      return;
    }

    this.errorElement.textContent = message;
    this.errorElement.style.display = "block";
  }

  clearError() {
    if (!this.errorElement) {
      return;
    }

    this.errorElement.style.display = "none";
    this.errorElement.textContent = "";
  }
}

function getFileIconClass(mimeType, fileName) {
  if (isImageByMimeType(mimeType, fileName)) {
    return "bi-image";
  }

  const extension = (fileName || "").split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    return "bi-file-earmark-pdf";
  }

  if (["doc", "docx", "txt", "rtf"].includes(extension || "")) {
    return "bi-file-earmark-text";
  }

  if (["zip", "rar", "7z", "tar", "gz"].includes(extension || "")) {
    return "bi-file-earmark-zip";
  }

  return "bi-file-earmark";
}

function isImage(file) {
  return file?.type?.startsWith("image/");
}

function isImageByMimeType(mimeType, fileName) {
  if (mimeType?.startsWith("image/")) {
    return true;
  }

  const extension = (fileName || "").split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(extension || "");
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value < 0) {
    return "-";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}
