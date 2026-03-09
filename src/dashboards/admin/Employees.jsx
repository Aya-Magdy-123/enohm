import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, UserX, Search, Plus, Phone,
  Loader2, Mail, Trash2, Edit3,
  LoaderCircleIcon,
  CircleArrowOutUpRight,
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/Modal';

const ROLES = ['مهندس موقع', 'مشرف', 'فني', 'محاسب', 'مدير مشروع', 'عمال'];
const DEPARTMENTS = ['الإنشاءات', 'الإكساء', 'الترميم', 'الإدارة', 'المالية'];

const roleColors = {
  'مهندس موقع': { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  'مشرف':        { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  'فني':          { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  'محاسب':        { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500' },
  'مدير مشروع':  { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
  'عمال':         { bg: 'bg-gray-50',   text: 'text-gray-600',   dot: 'bg-gray-400' },
};

const avatarColors = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-amber-400 to-amber-600',
  'from-teal-400 to-teal-600',
  'from-red-400 to-red-600',
  'from-green-400 to-green-600',
];

const getRoleColor = (role) =>
  roleColors[role] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };

function Employees() {
  const { t, i18n } = useTranslation();

  const [employees, setEmployees]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [searchQuery, setSearchQuery]         = useState('');
  const [activeTab, setActiveTab]             = useState('all');
  const [openAddModal, setOpenAddModal]       = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openRestoreModal, setOpenRestoreModal] = useState(false);
  const [openEditModal, setOpenEditModal]     = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [submitting, setSubmitting]= useState(false);
  const [refreshKey, setRefreshKey ]= useState(false);
  
  

  const emptyForm = { name: '', phone: '', email: '', role: '', department: '', status: 'active' };
  const [form, setForm] = useState(emptyForm);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'employees'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, [refreshKey]);

  const handleAdd = async () => {
    if (!form.name || !form.phone ) return;
    setSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("http://localhost:5000/add-employee", {
        method:"POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({email: form.email, displayName: form.name})
      })
      if(res.ok){
        const data = await res.json();
       console.log("result", data.uid);
      
      
      await setDoc(doc(db, 'employees', data.uid), { ...form, createdAt: serverTimestamp() });
      setRefreshKey((prev)=> prev+1);
      
            setForm(emptyForm);
      setOpenAddModal(false);
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'employees', selectedEmployee.id), form);
      setEmployees(prev => prev.map(e => e.id === selectedEmployee.id ? { ...e, ...form } : e));
      setOpenEditModal(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await updateDoc(doc(db, 'employees', selectedEmployee.id), { status: 'inactive' });
        setRefreshKey((prev)=>prev+1);
      setOpenDeleteModal(false);
    } catch (err) { console.error(err); }
  };

  const openEdit = (emp) => {
    setSelectedEmployee(emp);
    setForm({ name: emp.name, phone: emp.phone, email: emp.email || '',  department: emp.department || '', status: emp.status || 'active' });
    setOpenEditModal(true);
  };

  const openDelete = (emp) => {
    setSelectedEmployee(emp);
    setOpenDeleteModal(true);
  };

  const restoreEmp = (emp) => {
    setSelectedEmployee(emp);
    setForm({ name: emp.name, phone: emp.phone, email: emp.email || '',  department: emp.department || '', status: emp.status || 'active' });
    setOpenRestoreModal(true);
  };

  const handleRestore=async()=>{
    try{
      await updateDoc(doc(db, 'employees', selectedEmployee.id), {status: 'active' });
        setRefreshKey((prev)=>prev+1);
      setOpenRestoreModal(false);
    }
    catch(e){console.log(e.message);
    }

  }

  const total    = employees.length;
  const active   = employees.filter(e => e.status === 'active').length;
  const inactive = employees.filter(e => e.status !== 'active').length;

  const stats = [
    { title: t("employees.stats.total"),  value: total,    icon: Users,     textColor: 'text-blue-500',   bgLight: 'bg-blue-50' },
    { title:t("employees.stats.active"), value: active,   icon: UserCheck, textColor: 'text-green-500',  bgLight: 'bg-green-50' },
    { title: t("employees.stats.inactive") ,        value: inactive, icon: UserX,     textColor: 'text-orange-500', bgLight: 'bg-orange-50' },
  ];

  const tabs = [
    { key: 'all',      label: t("employees.tabs.all"),    count: total },
    { key: 'active',   label: t("employees.tabs.active") ,     count: active },
    { key: 'inactive', label: t("employees.tabs.inactive") , count: inactive },
  ];

  const filtered = employees.filter(e => {
    const matchTab    = activeTab === 'all' ? true : activeTab === 'active' ? e.status === 'active' : e.status !== 'active';
    const matchSearch = e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        // e.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.phone?.includes(searchQuery);
    return matchTab && matchSearch;
  });

 

  return (
    <div className="space-y-6" dir={i18n.language==="ar"? "rtl": "ltr"}>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">{stat.title}</p>
                <p className="text-3xl font-bold text-blue-950">{stat.value}</p>
              </div>
              <div className={`${stat.bgLight} p-3 rounded-xl`}>
                <Icon className={`w-7 h-7 ${stat.textColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Search + Add ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder= {t("employees.search.placeholder")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
            />
          </div>
          <button onClick={fetchEmployees}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-600 transition">
            {t("employees.buttons.refresh")}
          </button>
          <button
            onClick={() => { setForm(emptyForm); setOpenAddModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f2a057] hover:bg-[#e08f42] text-white rounded-xl text-sm font-bold transition shadow-sm shadow-[#f2a057]/30">
            <Plus className="w-4 h-4" />
            {t("employees.buttons.addEmployee")}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === tab.key ? 'bg-[#f2a057] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
              {tab.label}
              <span className={`mx-1.5 px-1.5 py-0.5 rounded-md text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 text-[#f2a057] animate-spin" />
        </div>
      )}

      {/* ── Table ── */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400">#</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400">{t("employees.table.employee")}</th>
                  {/* <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400">الوظيفة</th> */}
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400">{t("employees.table.department")}</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400">{t("employees.table.phone")}</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400">{t("employees.table.email")}</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400">{t("employees.table.status")}</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400">{t("employees.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((emp, i) => {
                  const roleColor  = getRoleColor(emp.role);
                  const isActive   = emp.status === 'active';
                  const avatarGrad = avatarColors[i % avatarColors.length];

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors duration-150 group">

                      {/* # */}
                      <td className="px-5 py-4 text-xs text-gray-300 font-medium">{i + 1}</td>

                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <span className="text-white font-bold text-sm">{emp.name?.charAt(0)}</span>
                          </div>
                          <span className="font-semibold text-blue-950 text-sm whitespace-nowrap">{emp.name}</span>
                        </div>
                      </td>

                      {/* Role */}
                      {/* <td className="px-5 py-4">
                        {emp.role
                          ? <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${roleColor.bg} ${roleColor.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${roleColor.dot}`}></span>
                              {emp.role}
                            </span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td> */}

                      {/* Department */}
                      <td className="px-5 py-4 text-sm text-gray-500">{emp.department || '—'}</td>

                      {/* Phone */}
                      <td className="px-5 py-4">
                        <a href={`tel:${emp.phone}`}
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#f2a057] transition whitespace-nowrap">
                          <Phone className="w-3.5 h-3.5 text-[#f2a057]" />
                          {emp.phone || '—'}
                        </a>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        {emp.email
                          ? <span className="flex items-center gap-1.5 text-sm text-gray-400">
                              <Mail className="w-3.5 h-3.5 text-gray-300" />
                              {emp.email}
                            </span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                          {isActive ? t("employees.status.active") : t("employees.status.inactive")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        {isActive ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(emp)}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDelete(emp)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                ): <button onClick={() => restoreEmp(emp)}
                            className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition">
                            <CircleArrowOutUpRight className="w-4 h-4" />
                          </button>
                          }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
             {t("employees.table.totalResults")} <span className="font-bold text-gray-600">{filtered.length}</span> {t("employees.table.employeeUnit")}
            </p>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1"> {t("employees.empty.title")}       </h3>
          <p className="text-sm text-gray-400"> {t("employees.empty.subtitle")} </p>
        </div>
      )}

      {/* ====== ADD MODAL ====== */}
      {openAddModal && (
        <Modal onClose={() => setOpenAddModal(false)}>
          <div className="flex flex-col gap-2">
            <h1 className={`font-bold text-xl px-2 text-blue-950 ${i18n.language==="ar"? "border-r-4 border-r-orange-500":"border-l-4 border-l-orange-500"} py-1`}> {t("employees.addModal.title")} </h1>
            <hr className="text-gray-200 rounded-full w-full" />
             <div className="space-y-4 mt-4">

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block"> {t("employees.addModal.fullName")}  </label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
            placeholder="اسم الموظف" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block"> {t("employees.addModal.phone")}   </label>
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
            placeholder="رقم الهاتف" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block"> {t("employees.addModal.email")}  </label>
        <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
          placeholder="example@email.com" />
      </div>
      <div className="grid grid-cols-2 gap-3">
   
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block"> {t("employees.addModal.department")}   </label>
          <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none bg-white">
            <option value=""> {t("employees.addModal.departmentPlaceholder")}   </option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block"> {t("employees.addModal.status")}  </label>
        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none bg-white">
          <option value="active"> {t("employees.status.active")} </option>
          <option value="inactive"> {t("employees.status.inactive")}  </option>
        </select>
      </div>
      </div>
      
    </div>

            <div className="flex gap-2 mt-2 justify-end">
              <button onClick={() => setOpenAddModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                {t("employees.buttons.cancel")}
              </button>
              <button onClick={handleAdd} disabled={submitting}
                className="px-8 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-60">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("employees.buttons.save")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ====== EDIT MODAL ====== */}
      {openEditModal && (
        <Modal onClose={() => setOpenEditModal(false)}>
          <div className="flex flex-col gap-2">
            <h1 className={`font-bold text-xl px-2 text-blue-950 ${i18n.language==="ar"? "border-r-4 border-r-orange-500":"border-l-4 border-l-orange-500"} py-1`}>  {t("employees.editModal.title")}</h1>
            <hr className="text-gray-200 rounded-full w-full" />
                     <div className="space-y-4 mt-4">

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block"> {t("employees.addModal.fullName")}   </label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
            placeholder="اسم الموظف" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block"> {t("employees.addModal.phone")}   </label>
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
            placeholder="رقم الهاتف" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">  {t("employees.addModal.email")}  </label>
        <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
          placeholder="example@email.com" />
      </div>
      <div className="grid grid-cols-2 gap-3">
   
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block"> {t("employees.addModal.department")}   </label>
          <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none bg-white">
            <option value="">  {t("employees.addModal.departmentPlaceholder")} </option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">{t("employees.addModal.status")}</label>
        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none bg-white">
          <option value="active"> {t("employees.status.active")} </option>
          <option value="inactive">  {t("employees.status.inactive")}  </option>
        </select>
      </div>
      </div>
      
    </div>
            <div className="flex gap-2 mt-2 justify-end">
              <button onClick={() => setOpenEditModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                 {t("employees.buttons.cancel")} 
              </button>
              <button onClick={handleEdit} disabled={submitting}
                className="px-8 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-60">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t("employees.buttons.refresh")} 
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ====== DELETE MODAL ====== */}
      {openDeleteModal && (
        <Modal onClose={() => setOpenDeleteModal(false)}>
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-red-500 py-1"> {t("employees.deleteModal.title")} </h1>
            <hr className="text-gray-200 rounded-full w-full" />
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-lg">{selectedEmployee?.name?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">{selectedEmployee?.name}</p>
                <p className="text-sm text-gray-500">{selectedEmployee?.phone}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">  {t("employees.deleteModal.message")} </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpenDeleteModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                {t("employees.buttons.cancel")}
              </button>
              <button onClick={handleDelete}
                className="px-8 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200">
                {t("employees.buttons.delete")}
              </button>
            </div>
          </div>
        </Modal>
      )}


      {openRestoreModal && (
        <Modal onClose={() => setOpenRestoreModal(false)}>
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-green-500 py-1"> {t("employees.restoreModal.title")} </h1>
            <hr className="text-gray-200 rounded-full w-full" />
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-lg">{selectedEmployee?.name?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">{selectedEmployee?.name}</p>
                <p className="text-sm text-gray-500">{selectedEmployee?.phone}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center"> {t("employees.restoreModal.message")} </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpenRestoreModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                {t("employees.buttons.cancel")}
              </button>
              <button onClick={handleRestore}
                className="px-8 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200">
                {t("employees.buttons.restore")}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

export default Employees;