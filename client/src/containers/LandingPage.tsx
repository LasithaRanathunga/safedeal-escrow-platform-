import Header from "./Header";
import Footer from "./Footer";

import { Outlet } from "react-router";

export default function LandingPage() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
