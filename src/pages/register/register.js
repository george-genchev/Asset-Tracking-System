import "./register.css";
import html from "./register.html?raw";
import { signUp } from "../../lib/supabase.js";

const page = {
  title: "Register | Asset Tracking System",
  render() {
    return html;
  },
  init() {
    initRegisterForm();
  }
};

function initRegisterForm() {
  const form = document.getElementById("register-form");
  const submitBtn = document.getElementById("submit-btn");
  const errorAlert = document.getElementById("error-alert");
  const successAlert = document.getElementById("success-alert");
  const loadingState = document.getElementById("loading-state");
  const formContainer = document.querySelector(".auth-form");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear alerts
    errorAlert.classList.add("d-none");
    successAlert.classList.add("d-none");

    // Get form values
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    // Validation
    if (!email || !password || !passwordConfirm) {
      showError(errorAlert, "All fields are required");
      return;
    }

    if (password !== passwordConfirm) {
      showError(errorAlert, "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      showError(errorAlert, "Password must be at least 8 characters");
      return;
    }

    // Show loading state
    setFormLoading(true, submitBtn, formContainer, loadingState);

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        showError(errorAlert, error.message || "Failed to create account");
        setFormLoading(false, submitBtn, formContainer, loadingState);
        return;
      }

      // Success
      showSuccess(
        successAlert,
        "Account created successfully! Please check your email to confirm your account."
      );

      // Reset form
      form.reset();

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.hash = "#/login";
      }, 2000);
    } catch (err) {
      showError(errorAlert, err.message || "An unexpected error occurred");
      setFormLoading(false, submitBtn, formContainer, loadingState);
    }
  });
}

function showError(alertElement, message) {
  alertElement.textContent = message;
  alertElement.classList.remove("d-none");
  alertElement.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showSuccess(alertElement, message) {
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
