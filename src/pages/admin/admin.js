import "./admin.css";
import html from "./admin.html?raw";
import { getCurrentUser, isCurrentUserAdmin } from "../../lib/supabase.js";

const page = {
  title: "Admin Panel | Asset Tracking System",
  render() {
    return html;
  },
  async init() {
    const { user, error: userError } = await getCurrentUser();

    if (userError || !user) {
      window.location.hash = "#/login";
      return;
    }

    const { isAdmin, error: adminError } = await isCurrentUserAdmin();

    if (adminError || !isAdmin) {
      window.location.hash = "#/dashboard";
    }
  }
};

export default page;
