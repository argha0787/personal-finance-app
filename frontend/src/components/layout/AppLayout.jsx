import { Outlet } from "react-router-dom";
import Footer from "../common/Footer.jsx";
import Navbar from "../common/Navbar.jsx";
import Sidebar from "../common/Sidebar.jsx";

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <div className="app-shell">
        <Sidebar />
        <main className="page"><Outlet /></main>
      </div>
      <Footer />
    </>
  );
}
