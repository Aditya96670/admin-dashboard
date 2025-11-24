import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen, activeTab, setActiveTab, onResetForm }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "products", label: "Products" },
    { id: "addProduct", label: "Add Product" },
    { id: "orders", label: "Orders" },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "addProduct") {
      onResetForm();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } bg-gray-900 text-white transition-all duration-300 overflow-hidden shrink-0 h-full flex flex-col`}
    >
      <h2 className="p-6 text-xl font-bold tracking-wide">BEYOUNG ADMIN</h2>

      <nav className="space-y-1 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`w-full text-left px-6 py-3 hover:bg-gray-800 flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? "bg-gray-800 border-l-4 border-blue-500"
                : ""
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 hover:bg-red-600 rounded flex items-center gap-2 text-red-200 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
