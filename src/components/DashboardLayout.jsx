import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, Menu, X, Users, Bell, Check, CheckCheck, Settings } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function DashboardLayout() {
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState();
  const [role, setRole] = useState("");
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);

  /* ── auth fix ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdTokenResult();
        setRole(token.claims.role || '');
        setUser(u);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const getNotifications = async () => {
      if(!user) return;
      let q;
      if(role=== 'admin'){
        q= query(collection(db, "notifications"), where("type", "in",["updatedRequest", "newRequest"]))
      }
      if(role === "employee"){
        q= query(collection(db, "notifications"), where("type", "==","approvedRequest") , where("employeeId","==",user.uid));

      }
      const res = await getDocs(q);
      const snapshot = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // let notifs = snapshot.filter((notify)=> role==='employee' && notify.type === "approvedRequest" ? notify.employeeId === user?.uid : role==='admin'? notify.type==="updatedRequest" || notify.type==="newRequest" : null);
      setNotifications(snapshot);
      // console.log("user", user.uid , "notifs", notifs);
      
    };
    getNotifications();
  }, [user]);

  /* ── close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── mark single as read ── */
  const markRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  /* ── mark all as read ── */
  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  /* ── logout ── */
  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const adminItems = [
    { name: 'الرئيسية', path: '/dashboard', icon: LayoutDashboard },
    { name: 'الطلبات', path: '/dashboard/requests', icon: FileText },
    { name: 'الموظفين', path: '/dashboard/employees', icon: Users },
    { name: 'الاعدادات', path: '/dashboard/adminSettings', icon: Settings },
  ];

  const employeeItems = [
    { name: 'الرئيسية', path: '/dashboard/home', icon: LayoutDashboard },
    { name: 'الطلبات', path: '/dashboard/employeeRequests', icon: FileText },
    { name: 'الاعدادات', path: '/dashboard/employeeSettings', icon: Settings },
  ];

  const menuItems = role === 'admin' ? adminItems : employeeItems;

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

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <div className="text-end">
              {/* <p className="text-sm font-semibold text-gray-700">مرحباً</p> */}
              {/* <p className="text-xs text-gray-500">{user?.email}</p> */}
            </div>

            {/* ── Bell ── */}
            <div className="relative w-12" ref={notifRef}>
              <div className="w-10 h-10 bg-[#f2a057] hover:scale-[105%] transition-all shadow-sm cursor-pointer rounded-full flex items-center justify-center text-white font-bold">
                <Bell className="w-5 h-5" onClick={() => setShow(!show)} />
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-600 p-2 shadow-md animate-pulse transition-all rounded-full text-xs absolute bottom-0"></span>
              )}

              {show &&
                <div className="absolute mt-2 z-40 left-0 bg-white w-[300px] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

                  {/* header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#f2a057]" />
                      <span className="font-bold text-blue-950 text-sm">الإشعارات</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead}
                        className="flex items-center gap-1 text-xs text-[#f2a057] hover:text-orange-500 font-semibold transition">
                        <CheckCheck className="w-3.5 h-3.5" />
                        تعليم الكل كمقروء
                      </button>
                    )}
                  </div>

                  {/* list */}
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">لا توجد إشعارات</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        let text = '';
                        let dot = 'bg-gray-400';
                        let Role;

                        if (notification.type === 'newRequest' ) {
                          text = `تم إرسال طلب جديد بتاريخ ${notification.submittedAt?.toDate().toLocaleDateString()}`;
                          dot = 'bg-blue-500';
                          Role="admin";
                        }
                        if (notification.type === 'approvedRequest' ) {
                          text = `تم تعيينك لإنجاز طلب من نوع ${notification.serviceType} ${notification.submittedAt?.toDate().toLocaleDateString()}`;
                          dot = 'bg-teal-500';
                          Role="employee";

                        }
                        if (notification.type === 'updatedRequest' ) {
                          text = `تم تعديل حالة طلب ${notification.client} من قبل الموظف ${notification.employeeName} إلى ${notification.status} بتاريخ ${notification.submittedAt?.toDate().toLocaleDateString()}`;
                          dot = 'bg-amber-500';
                          Role="admin";

                        }

                        if (role !== Role) return null;

                        return (                         
                          <div key={notification.id}
                            className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 transition-colors
                              ${notification.read ? 'bg-white' : 'bg-blue-50/50'}`}>

                            {/* dot */}
                            <div className="flex-shrink-0 mt-1.5">
                              <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-gray-300' : dot}`} />
                            </div>

                            {/* text */}
                            <p className={`flex-1 text-sm leading-snug
                              ${notification.read ? 'text-gray-400' : 'text-gray-800 font-semibold'}`}>
                              {text}
                            </p>

                            {/* mark read / already read */}
                            {!notification.read ? (
                              <button onClick={() => markRead(notification.id)}
                                title="تعليم كمقروء"
                                className="flex-shrink-0 w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-green-50 hover:border-green-300 flex items-center justify-center transition-all group">
                                <Check className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-500 transition-colors" />
                              </button>
                            ) : (
                              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                                <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                              </div>
                            )}
                          </div>
                      )
                      
                      })
                    )}
                  </div>
                  

                  {/* footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-center">
                      <p className="text-xs text-gray-400">
                        {notifications.length} إشعار — {unreadCount} غير مقروء
                      </p>
                    </div>
                  )}
                </div>
              }
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