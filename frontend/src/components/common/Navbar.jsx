import { Bell, LogOut, Plus, Search, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (requestError) {
      setLogoutError(requestError.message);
    }
  }

  return (
    <header className="app-header">
      <Link className="brand" to="/" aria-label="Ledgerly home"><span className="brand-mark">L</span><span>ledgerly</span></Link>
      <div className="topbar-search">
        <Search size={16} aria-hidden="true" />
        <input aria-label="Search transactions" placeholder="Search your finances" onKeyDown={(event) => {
          if (event.key === "Enter" && event.currentTarget.value.trim()) {
            navigate(`/transactions?search=${encodeURIComponent(event.currentTarget.value.trim())}`);
          }
        }} />
        <kbd>↵</kbd>
      </div>
      <div className="topbar-actions">
        <button className="button button-primary button-small" type="button" onClick={() => navigate("/transactions?new=1")}><Plus size={16} /> Add entry</button>
        <Link className="icon-button topbar-notice" to="/notifications" aria-label="Notifications"><Bell size={18} /><span /></Link>
        <div className="profile-chip"><span className="avatar"><UserRound size={16} /></span><span className="profile-name">{user?.name}</span></div>
        <button className="icon-button" type="button" aria-label="Sign out" onClick={handleLogout}><LogOut size={17} /></button>
      </div>
      {logoutError && <span className="logout-error" role="alert">{logoutError}</span>}
    </header>
  );
}