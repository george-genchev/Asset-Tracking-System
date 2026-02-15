import "./header.css";
import { getCurrentUser } from "../../lib/supabase.js";

export function initHeader(activePath) {
  const links = document.querySelectorAll("[data-route]");
  links.forEach((link) => {
    const route = link.getAttribute("data-route");
    link.classList.toggle("active", route === activePath);
  });

  updateAuthUI();
}

async function updateAuthUI() {
  const loginMobile = document.getElementById("nav-login-mobile");
  const registerMobile = document.getElementById("nav-register-mobile");
  const loginDesktop = document.getElementById("nav-login-desktop");
  const registerDesktop = document.getElementById("nav-register-desktop");
  const userItem = document.getElementById("nav-user");
  const userName = document.getElementById("nav-user-name");

  if (!userItem || !userName) {
    return;
  }

  try {
    const { user } = await getCurrentUser();

    if (user) {
      const displayName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email;

      userName.textContent = displayName || "Account";
      userItem.classList.remove("d-none");

      loginMobile?.classList.add("d-none");
      registerMobile?.classList.add("d-none");
      loginDesktop?.classList.add("d-none");
      registerDesktop?.classList.add("d-none");
    } else {
      userItem.classList.add("d-none");

      loginMobile?.classList.remove("d-none");
      registerMobile?.classList.remove("d-none");
      loginDesktop?.classList.remove("d-none");
      registerDesktop?.classList.remove("d-none");
    }
  } catch (error) {
    userItem.classList.add("d-none");
    loginMobile?.classList.remove("d-none");
    registerMobile?.classList.remove("d-none");
    loginDesktop?.classList.remove("d-none");
    registerDesktop?.classList.remove("d-none");
  }
}
