const Sidebar = ({ sidebarOpen, activeTab, setActiveTab, onResetForm }) => {
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

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } bg-gray-900 text-white transition-all duration-300 overflow-hidden shrink-0`}
    >
      <h2 className="p-6 text-xl font-bold tracking-wide">BEYOUNG ADMIN</h2>
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`w-full text-left px-6 py-3 hover:bg-gray-800 flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-gray-800 border-l-4 border-blue-500"
                : ""
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
