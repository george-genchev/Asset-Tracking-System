import { initHeader } from "./components/header/header.js";
import { initFooter } from "./components/footer/footer.js";
import headerHtml from "./components/header/header.html?raw";
import footerHtml from "./components/footer/footer.html?raw";
import indexPage from "./pages/index/index.js";
import dashboardPage from "./pages/dashboard/dashboard.js";
import loginPage from "./pages/login/login.js";
import registerPage from "./pages/register/register.js";
import strategyPage from "./pages/strategy/strategy.js";
import strategiesListPage from "./pages/strategies/strategies.js";
import strategiesAddPage from "./pages/strategies/add/add.js";
import strategiesEditPage from "./pages/strategies/edit/edit.js";
import notFoundPage from "./pages/not-found/not-found.js";

const routes = {
  "/": indexPage,
  "/dashboard": dashboardPage,
  "/login": loginPage,
  "/register": registerPage,
  "/strategies": strategiesListPage,
  "/strategies/add": strategiesAddPage
};

// Dynamic routes patterns (order matters - check more specific patterns first)
const dynamicRoutes = [
  { pattern: /^\/strategies\/edit\/[^/?]+$/, page: strategiesEditPage },
  { pattern: /^\/strategies\/[^/?]+$/, page: strategyPage }
];

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

function getRoute(path) {
  // Check static routes first
  if (routes[path]) {
    return routes[path];
  }

  // Check dynamic routes
  for (const { pattern, page } of dynamicRoutes) {
    if (pattern.test(path)) {
      return page;
    }
  }

  // Return 404 page for non-existent routes
  return notFoundPage;
}

function handleRoute() {
  const path = getPath();
  const route = getRoute(path);

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
