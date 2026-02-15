import "./login.css";
import html from "./login.html?raw";
import { signIn } from "../../lib/supabase.js";

const page = {
  title: "Sign In | Asset Tracking System",
  render() {
    return html;
  },
  init() {
    initLoginForm();
    initDemoButtons();
  }
};

function initLoginForm() {
  const form = document.getElementById("login-form");
  const submitBtn = document.getElementById("submit-btn");
  const errorAlert = document.getElementById("error-alert");
  const loadingState = document.getElementById("loading-state");
  const formContainer = document.querySelector(".auth-form");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear alerts
    errorAlert.classList.add("d-none");

    // Get form values
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Validation
    if (!email || !password) {
      showError(errorAlert, "Email and password are required");
      return;
    }

    // Show loading state
    setFormLoading(true, submitBtn, formContainer, loadingState);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        showError(errorAlert, error.message || "Failed to sign in. Please check your credentials.");
        setFormLoading(false, submitBtn, formContainer, loadingState);
        return;
      }

      // Success - redirect to dashboard
      setTimeout(() => {
        window.location.hash = "#/dashboard";
      }, 500);
    } catch (err) {
      showError(errorAlert, err.message || "An unexpected error occurred");
      setFormLoading(false, submitBtn, formContainer, loadingState);
    }
  });
}

function initDemoButtons() {
  const demoAccounts = {
    alice: { email: "alice@example.com", password: "password123" },
    bob: { email: "bob@example.com", password: "password123" },
    carol: { email: "carol@example.com", password: "password123" }
  };

  Object.entries(demoAccounts).forEach(([key, credentials]) => {
    const btn = document.getElementById(`demo-${key}`);
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("email").value = credentials.email;
        document.getElementById("password").value = credentials.password;
        document.getElementById("login-form").scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  });
}

function showError(alertElement, message) {
  alertElement.textContent = message;
  alertElement.classList.remove("d-none");
  alertElement.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setFormLoading(isLoading, submitBtn, formContainer, loadingState) {
  if (isLoading) {
    formContainer.classList.add("d-none");
    loadingState.classList.remove("d-none");
    submitBtn.disabled = true;
  } else {
    formContainer.classList.remove("d-none");
    loadingState.classList.add("d-none");
    submitBtn.disabled = false;
  }
}

export default page;
