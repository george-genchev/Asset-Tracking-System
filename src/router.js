import { initHeader } from "./components/header/header.js";
import { initFooter } from "./components/footer/footer.js";
import headerHtml from "./components/header/header.html?raw";
import footerHtml from "./components/footer/footer.html?raw";
import indexPage from "./pages/index/index.js";
import dashboardPage from "./pages/dashboard/dashboard.js";

const routes = {
  "/": indexPage,
  "/dashboard": dashboardPage
};

function getPath() {
  const hash = window.location.hash || "#/";
  const path = hash.startsWith("#") ? hash.slice(1) : hash;
  return path || "/";
}

function renderLayout(contentHtml) {
  const app = document.getElementById("app");
  if (!app) {
    return;
  }

  app.innerHTML = `
    ${headerHtml}
    <main class="page-shell">
      <div class="container py-4" id="page-root">
        ${contentHtml}
      </div>
    </main>
    ${footerHtml}
  `;
}

function handleRoute() {
  const path = getPath();
  const route = routes[path] || routes["/"];

  renderLayout(route.render());
  document.title = route.title;
  initHeader(path);
  route.init?.();
  initFooter();
}

export function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}
