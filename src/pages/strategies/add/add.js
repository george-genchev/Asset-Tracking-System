import "../form.css";
import html from "./add.html?raw";
import { getCurrentUser, createStrategy } from "../../../lib/supabase.js";

const page = {
  title: "Create Strategy | Asset Tracking System",
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

      const form = document.getElementById("add-strategy-form");
      const submitBtn = document.getElementById("submit-btn");
      const errorMessage = document.getElementById("error-message");

      if (form) {
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

            const { data, error } = await createStrategy(user.id, title, description || null);
            
            if (error) {
              console.error("Error creating strategy:", error);
              errorMessage.textContent = error.message || "Failed to create strategy";
              errorMessage.style.display = "block";
              submitBtn.disabled = false;
              return;
            }

            // Success - redirect to strategies list
            window.location.hash = "#/strategies";
          } catch (error) {
            console.error("Error:", error);
            errorMessage.textContent = "An error occurred while creating the strategy";
            errorMessage.style.display = "block";
            submitBtn.disabled = false;
          }
        });
      }
    } catch (error) {
      console.error("Error initializing add strategy page:", error);
    }
  }
};

export default page;
