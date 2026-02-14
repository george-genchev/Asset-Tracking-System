import "./header.css";

export function initHeader(activePath) {
  const links = document.querySelectorAll("[data-route]");
  links.forEach((link) => {
    const route = link.getAttribute("data-route");
    link.classList.toggle("active", route === activePath);
  });
}
