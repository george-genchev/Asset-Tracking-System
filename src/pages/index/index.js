import "./index.css";
import html from "./index.html?raw";

const page = {
  title: "Asset Tracking System - Manage Your Investment Portfolio",
  render() {
    return html;
  },
  init() {
    // Add smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#/"]').forEach(anchor => {
      anchor.addEventListener('click', function() {
        // Router will handle navigation
      });
    });
  }
};

export default page;
