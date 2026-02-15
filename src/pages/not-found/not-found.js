import "./not-found.css";
import html from "./not-found.html?raw";

const page = {
  title: "404 - Page Not Found | Asset Tracking System",
  render() {
    return html;
  },
  init() {}
};

export default page;
