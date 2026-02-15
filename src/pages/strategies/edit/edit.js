import "../form.css";
import html from "./edit.html?raw";
import { getCurrentUser, getStrategyById, updateStrategy, getAssetsByStrategy } from "../../../lib/supabase.js";

let strategyId = null;

const page = {
  title: "Edit Strategy | Asset Tracking System",
  render() {
    return html;
  },
  async init() {
    try {
      // Get strategy ID from URL hash
      const hash = window.location.hash;
      const match = hash.match(/#\/strategies\/edit\/([^/?]+)/);
      
      if (!match || !match[1]) {
        window.location.hash = "#/strategies";
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
        showLoadingError("Strategy not found");
        return;
      }

      // Verify ownership
      if (strategy.owner_id !== user.id) {
        showLoadingError("You do not have permission to edit this strategy");
        return;
      }

      // Fetch assets count
      const { data: assets } = await getAssetsByStrategy(strategyId);
      
      // Hide loading and show form
      document.getElementById("loading").style.display = "none";
      document.getElementById("edit-strategy-form").style.display = "block";

      // Populate form
      document.getElementById("title").value = strategy.title;
      document.getElementById("description").value = strategy.description || "";
      
      // Show strategy info
      document.getElementById("created-date").textContent = formatDate(strategy.created_at);
      document.getElementById("updated-date").textContent = formatDate(strategy.updated_at);
      document.getElementById("asset-count").textContent = assets?.length || 0;

      // Handle form submission
      const form = document.getElementById("edit-strategy-form");
      const submitBtn = document.getElementById("submit-btn");
      const errorMessage = document.getElementById("error-message");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          return;
        }

        submitBtn.disabled = true;
        errorMessage.style.display = "none";

        try {
          const title = document.getElementById("title").value.trim();
          const description = document.getElementById("description").value.trim();

          const { error } = await updateStrategy(strategyId, title, description || null);
          
          if (error) {
            console.error("Error updating strategy:", error);
            errorMessage.textContent = error.message || "Failed to update strategy";
            errorMessage.style.display = "block";
            submitBtn.disabled = false;
            return;
          }

          // Success - redirect to strategies list
          window.location.hash = "#/strategies";
        } catch (error) {
          console.error("Error:", error);
          errorMessage.textContent = "An error occurred while updating the strategy";
          errorMessage.style.display = "block";
          submitBtn.disabled = false;
        }
      });
    } catch (error) {
      console.error("Error initializing edit strategy page:", error);
      showLoadingError("An error occurred while loading the strategy");
    }
  }
};

function showLoadingError(message) {
  document.getElementById("loading").style.display = "none";
  const errorDiv = document.getElementById("error-loading");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default page;
