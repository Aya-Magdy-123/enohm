import React, { useState } from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, Menu, X } from 'lucide-react';

function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const menuItems = [
    { name: 'الرئيسية', path: '/dashboard', icon: LayoutDashboard },
    { name: 'الطلبات', path: '/dashboard/requests', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar للموبايل */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-blue-950 text-white z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <img 
            src="https://enohm.net/wp-content/uploads/2024/06/cropped-gif.webp" 
            className="w-40 h-auto mx-auto filter brightness-0 invert"
            alt="Enohm Logo"
          />
        </div>

        {/* Menu */}
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all
                  ${isActive 
                    ? 'bg-[#f2a057] text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-blue-900 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:mr-64">
        {/* Top Bar */}
        <header className="bg-white shadow-md p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <h1 className="text-2xl font-bold text-blue-950">لوحة التحكم</h1>
          
          <div className="flex items-center gap-3">
            <div className="text-end">
              <p className="text-sm font-semibold text-gray-700">مرحباً</p>
              <p className="text-xs text-gray-500">{localStorage.getItem('userEmail')}</p>
            </div>
            <div className="w-10 h-10 bg-[#f2a057] rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;