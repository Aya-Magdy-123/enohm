import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { UserCircle2, Mail, Lock, UserPlus, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Plus } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:5000';

/* ── Toast ── */
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  const isSuccess = type === 'success';
  return (
    <div className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold
      ${isSuccess ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
      {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </div>
  );
};

function AdminSettings() {
  const [user, setUser]= useState(null);
  const [displayName, setDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const { t, i18n } = useTranslation();


  const [resetLoading, setResetLoading] = useState(false);

  /* add admin modal */
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm]       = useState({ email: '', displayName: '' });
  const [addLoading, setAddLoading]     = useState(false);

  const [toast, setToast] = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  /* ── auth ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) { setUser(u); setDisplayName(u.displayName || ''); }
    });
    return unsub;
  }, []);


  const[d,setD]=useState([]);

  useEffect(()=>{
    const getData= async()=>{
    const res = await getDocs(collection(db,"admins"))
    const snapshot = res.docs.map((doc)=> {return {id:doc.id , ...doc.data()}})
    setD(snapshot)}

    getData()

  },
  
  []);

  /* ── update display name ── */
  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setEditingName(false);
      showToast(t("toast.nameUpdated"));
    } catch { showToast(t("toast.nameSaveError"), 'error'); }
    finally { setSavingName(false); }
  };

  /* ── password reset via email link ── */
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      showToast(t("toast.passwordResetSent"));
    } catch { showToast(t("toast.passwordResetError"), 'error'); }
    finally { setResetLoading(false); }
  };

  /* ── add admin ── */
  const handleAddAdmin = async () => {
    if (!adminForm.email) return showToast(t("toast.emailRequired"), 'error');
    setAddLoading(true);
    try {
      const token = await auth.currentUser.getIdToken(true);
      const res   = await fetch(`${API_URL}/add-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || t("toast.genericError"), 'error');
      showToast(t("toast.adminAdded"));
      setAdminForm({ email: '', displayName: '' });
      setShowAddAdmin(false);
    } catch { showToast(t("toast.serverError"), 'error'); }
    finally { setAddLoading(false); }
  };

  const initials = (displayName || user?.email || 'A').charAt(0).toUpperCase();

     return (
      <div className="w-full min-h-screen bg-gray-50 " dir={i18n.language==="ar"? "rtl": "ltr"}>

      <Toast msg={toast.msg} type={toast.type} />

      <div className="w-full space-y-8">

      {/* ───── Page Title ───── */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

      <h1 className="text-2xl font-bold text-blue-950 mb-2 ">
     {t("settings.pageTitle")}
      </h1>
      <p className='text-gray-400 text-xs mb-5 '> {t("settings.pageSubtitle")}</p>

      <div className="grid md:grid-cols-3 gap-4 items-end">

      {/* display name */}

      <div className="space-y-1">
      <label className="text-xs text-gray-500 font-semibold">
     {t("settings.name")}
      </label>

      {editingName ? (
      <input
      value={displayName}
      onChange={(e)=>setDisplayName(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 outline-none"
      />
      ) : (
      <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
      {user?.displayName || "—"}
      </div>
      )}

      </div>

      {/* email */}

      <div className="space-y-1">
      <label className="text-xs text-gray-500 font-semibold">
     {t("settings.email")}
      </label>

      <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
      {user?.email}
      </div>

      </div>

      {/* reset password */}

      <div className="space-y-1">

      <label className="text-xs text-gray-500 font-semibold">
     {t("settings.password")}
      </label>

      <button
      onClick={handlePasswordReset}
      disabled={resetLoading}
      className="w-full bg-red-600 hover:bg-blue-900 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
      >

      {resetLoading ? (
      <Loader2 className="w-4 h-4 animate-spin"/>
      ) : (
      <Lock className="w-4 h-4"/>
      )}

     {t("settings.changePassword")}

      </button>

      </div>

      </div>

      </div>


      {/* ───── Admins Section ───── */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">

      <div className="flex items-center justify-between">
<div className='flex flex-col items-start gap-2'>
      <h2 className="font-bold text-2xl text-blue-950">
      {t("admins.title")}
      </h2>
      <p className='text-xs text-gray-400'> {t("admins.subtitle")} </p>
</div>
      <button
      onClick={()=>setShowAddAdmin(!showAddAdmin)}
      className="bg-blue-950 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900"
      >
     <Plus className='w-4 h-4 inline-block'/>
     <span className='hidden md:inline-block'> {t("admins.addAdmin")}</span>
      </button>

      </div>


      {/* add admin form */}

      {showAddAdmin && (

      <div className="grid md:grid-cols-5 gap-3 p-4 bg-blue-50/10 border border-dashed border-blue-500 rounded-xl">

      <input
      type="text"
      value={adminForm.displayName}
      onChange={(e)=>setAdminForm(p=>({...p,displayName:e.target.value}))}
      placeholder={t("admins.adminNamePlaceholder")}
      className="border border-gray-200 col-span-2 rounded-lg px-3 py-2 text-sm"
      />

      <input
      type="email"
      value={adminForm.email}
      onChange={(e)=>setAdminForm(p=>({...p,email:e.target.value}))}
      placeholder={t("admins.emailPlaceholder")}
      className="border border-gray-200 col-span-2 rounded-lg px-3 py-2 text-sm"
      />

      <button
      onClick={handleAddAdmin}
      disabled={addLoading}
      className="bg-blue-950 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
      >

      {addLoading && <Loader2 className="w-4 h-4 animate-spin"/>}

      {t("admins.add")}

      </button>

      </div>

      )}


      {/* admins list */}

      <div className="grid md:grid-cols-1 gap-3">

      {d.map((admin)=>(

      <div
      key={admin.id}
      className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between"
      >

      <div className="flex flex-col">

      <span className="text-sm font-semibold text-gray-800">
      {admin.displayName || t("admins.noName")}
      </span>

      <span className="text-xs text-gray-400">
      {admin.email}
      </span>

      </div>

      <span className="text-xs bg-[#f2a057]/10 text-[#f2a057] px-2 py-1 rounded-full font-semibold">
      {t("admins.adminBadge")}
      </span>

      </div>

      ))}

      </div>

      </div>

      </div>

      </div>
      );
}

export default AdminSettings;