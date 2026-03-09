import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

function EmployeeSettings() {
  const { t, i18n } = useTranslation();
  const [authUser, setAuthUser]         = useState(null);
  const [employee, setEmployee]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [toast, setToast]               = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u || null));
    return unsub;
  }, []);

  useEffect(() => {
    if (!authUser) return;
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "employees", authUser.uid));
        if (!snap.empty) setEmployee(snap.data());
        console.log(snap.data());
        
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchEmployee();
  }, [authUser]);

  const handlePasswordReset = async () => {
    if (!authUser?.email) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, authUser.email);
      showToast(t('employeeSettings.toast.resetSuccess'));
    } catch {
      showToast(t('employeeSettings.toast.resetError'), 'error');
    }
    finally { setResetLoading(false); }
  };

  const emailDisplay = employee?.email || authUser?.email || '—';

  return (
    <div className="w-full min-h-screen bg-gray-50" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <Toast msg={toast.msg} type={toast.type} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#f2a057] animate-spin" />
        </div>
      ) : (
        <div className="w-full space-y-8">

          {/* ───── Page Title & Info ───── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h1 className="text-2xl font-bold text-blue-950 mb-2">
              {t('employeeSettings.title')}
            </h1>
            <p className="text-gray-400 text-xs mb-5">
              {t('settings.pageSubtitle')}
            </p>

            <div className="grid md:grid-cols-3 gap-4 items-end">

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold">
                  {t('employeeSettings.fields.name')}
                </label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
                  {employee?.name || '—'}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold">
                  {t('employeeSettings.fields.email')}
                </label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
                  {emailDisplay}
                </div>
              </div>

              {/* Phone */}
              {employee?.phone && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold">
                    {t('employeeSettings.fields.phone')}
                  </label>
                  <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
                    {employee.phone}
                  </div>
                </div>
              )}

              {/* Password Reset */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-semibold">
                  {t('employeeSettings.fields.password')}
                </label>
                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="w-full bg-red-600 hover:bg-blue-900 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition"
                >
                  {resetLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Lock className="w-4 h-4" />
                  }
                  {t('settings.changePassword')}
                </button>
              </div>

            </div>

           
          </div>


        </div>
      )}
    </div>
  );
}

export default EmployeeSettings;