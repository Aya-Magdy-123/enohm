import React, { useState, useEffect } from 'react';
import { MapPin, Home, Phone, Circle, User, Search, Loader2, AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import Modal from '../components/Modal';
import { useTranslation } from 'react-i18next';
import EmployeeNotes from '../components/EmployeeNotes';

function RejectionConfirmModal({ onClose, onSuccess, openLightbox }) {
  const { t, i18n } = useTranslation();
  const [submitting, setSubmitting]                       = useState(false);
  const [pendingRejectionRequests, setPendingRejectionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests]             = useState(true);

  const qualityLevelsLangs = {
    standard: t('quality.standard'),
    plus:     t('quality.plus'),
    premium:  t('quality.premium'),
  };

  useEffect(() => {
    const fetch = async () => {
      setLoadingRequests(true);
      try {
        const snap = await getDocs(
          query(
            collection(db, 'requests'),
            where('approvedByAdmin', '==', false),
            where('status', '==', 'pendingForReject')
          )
        );
        setPendingRejectionRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoadingRequests(false); }
    };
    fetch();
  }, []);

  /* الأدمن يوافق على الرفض → rejected نهائي */
  const handleConfirmRejection = async (req) => {
    if (!req) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'requests', req.id), {
        status:          'rejected',
        rejectedAt:      serverTimestamp(),
        approvedByAdmin: true,
      });

      await addDoc(collection(db, 'notifications'), {
              type:         'approveRejectionRequest',
              submittedAt:  serverTimestamp(),
              employeeId:   req.rejectedByEmployeeId,
              employeeName: req.rejectedByEmployeeName,
              client:       req.name,
              read:         false,
            });

      setPendingRejectionRequests(prev => prev.filter(r => r.id !== req.id));
      onSuccess(req.id, { status: 'rejected', approvedByAdmin: true });
      onClose();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  /* الأدمن يرفض طلب الرفض → يرجع approved */
  const handleDeclineRejection = async (req) => {
    if (!req) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'requests', req.id), {
        status:          'approved',
        approvedByAdmin: null,
      });
       await addDoc(collection(db, 'notifications'), {
              type:         'rejectRejectionRequest',
              submittedAt:  serverTimestamp(),
              employeeId:   req.rejectedByEmployeeId,
              employeeName: req.rejectedByEmployeeName,
              client:       req.name,
              read:         false,
            });
      setPendingRejectionRequests(prev => prev.filter(r => r.id !== req.id));
      onSuccess(req.id, { status: 'approved', approvedByAdmin: null });
      onClose();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-amber-500 py-1">
          {t('reviewRejection')}
        </h1>
        <hr className="text-gray-200 rounded-full w-full" />

        {loadingRequests ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pendingRejectionRequests.map((req) => (
              <div key={req.id} className="w-full bg-gray-50/10 border border-amber-100 rounded-xl px-4 py-4">
                <div className="p-3 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-sm">{req.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-blue-950 text-sm">{req.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.createdAt?.toDate?.().toLocaleDateString(
                            i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'de' ? 'de-DE' : 'en-US'
                          )}
                        </p>
                      </div>
                    </div>
                    <a href={`tel:${req.phoneNumber}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium transition">
                      <Phone className="w-3.5 h-3.5" /> {req.phoneNumber}
                    </a>
                  </div>

                  <div className="border-t border-dashed border-gray-100" />

                  {/* Details grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t('requests.location')}</p>
                      <p className="text-xs font-semibold text-gray-700 truncate">{req.location || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Home className="w-3 h-3" /> {t('requests.area')}</p>
                      <p className="text-xs font-semibold text-gray-700">{req.area || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Circle className="w-3 h-3" /> {t('requests.qualityLevel')}</p>
                      <p className="text-xs font-semibold text-gray-700 truncate">{qualityLevelsLangs[req.qualityLevel] || '—'}</p>
                    </div>
                  </div>

                  {req.notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                      <p className="text-xs text-amber-600 font-semibold mb-1">{t('requests.notes')}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{req.notes}</p>
                    </div>
                  )}

                  <EmployeeNotes request={req} />

                  {req.photos?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {req.photos.map((url, idx) => (
                        <div key={idx} onClick={() => openLightbox(req.photos, idx)}
                          className="relative group cursor-zoom-in w-[60px] h-[60px] rounded-xl overflow-hidden border border-gray-200">
                          <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition duration-200" alt="" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition duration-200 flex items-center justify-center">
                            <Search className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {req.rejectedByEmployeeId && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 px-3">
                    <User className="w-3 h-3" />
                    {t('rejectionRequestedByEmployee')}: {req.lastUpdatedByName || req.rejectedByEmployeeName}
                  </p>
                )}

                <div className="flex gap-2 justify-end mt-3">
                  <button onClick={() => handleDeclineRejection(req)} disabled={submitting}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50">
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {t('acceptRequest')}
                  </button>
                  <button onClick={() => handleConfirmRejection(req)} disabled={submitting}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200 flex items-center gap-2 disabled:opacity-60">
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {t('approveFinalRejection')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-full flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
            {t('cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default RejectionConfirmModal;