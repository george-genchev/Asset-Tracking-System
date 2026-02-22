import "./index.css";
import html from "./index.html?raw";
import { getCurrentUser, signOut } from "../../lib/supabase.js";

const page = {
  title: "Asset Tracking System - Manage Your Investment Portfolio",
  render() {
    return html;
  },
  async init() {
    try {
      const { user } = await getCurrentUser();
      updateAuthButtons(user);
    } catch (error) {
      console.error("Error checking auth state:", error);
    }

    // Add smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#/"]').forEach(anchor => {
      anchor.addEventListener('click', function() {
        // Router will handle navigation
      });
    });
  }
};

function updateAuthButtons(user) {
  const heroButtons = document.querySelector('.section-landing-hero .d-flex.gap-3');
  const ctaButtons = document.querySelector('.btn-group-vertical');

  if (user) {
    // User is signed in - show Dashboard and Sign Out
    if (heroButtons) {
      heroButtons.innerHTML = `
        <a class="btn btn-accent btn-lg" href="#/dashboard">Dashboard</a>
        <button class="btn btn-outline-accent btn-lg" id="signout-hero">Sign Out</button>
      `;
      document.getElementById('signout-hero')?.addEventListener('click', handleSignOut);
    }

    if (ctaButtons) {
      ctaButtons.innerHTML = `
        <a class="btn btn-accent btn-lg" href="#/dashboard">Go to Dashboard</a>
        <button class="btn btn-outline-dark btn-lg" id="signout-cta">Sign Out</button>
      `;
      document.getElementById('signout-cta')?.addEventListener('click', handleSignOut);
    }
  } else {
    // User is not signed in - show Get Started and Sign In (default HTML)
    if (heroButtons) {
      heroButtons.innerHTML = `
        <a class="btn btn-accent btn-lg" href="#/register">Get Started</a>
        <a class="btn btn-outline-accent btn-lg" href="#/login">Sign In</a>
      `;
    }

    if (ctaButtons) {
      ctaButtons.innerHTML = `
        <a class="btn btn-accent btn-lg" href="#/register">Create Account</a>
        <a class="btn btn-outline-dark btn-lg" href="#/login">Already have an account? Sign In</a>
      `;
    }
  }
}

async function handleSignOut(e) {
  e.preventDefault();
  try {
    await signOut();
    window.location.hash = "#/";
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

export default page;
