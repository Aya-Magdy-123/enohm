import React, { useState, useEffect } from 'react';
import { MapPin, Home, Phone, Circle, Search, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import Modal from '../components/Modal';
import { useTranslation } from 'react-i18next';
import EmployeeNotes from '../components/EmployeeNotes';

function CompletionConfirmModal({ onClose, onSuccess, openLightbox }) {
  const { t, i18n } = useTranslation();
  const [load, setLoad]                                         = useState(false);
  const [pendingCompletionRequests, setPendingCompletionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests]                   = useState(true);

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
            where('approvedForCompleting', '==', false),
            where('status', '==', 'pendingForCompleted')
          )
        );
        setPendingCompletionRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoadingRequests(false); }
    };
    fetch();
  }, []);

  const handleConfirmCompletion = async (req) => {
    if (!req) return;
    setLoad(true);
    try {
      await updateDoc(doc(db, 'requests', req.id), {
        status:                'completed',
        completedAt:           serverTimestamp(),
        approvedForCompleting: true,
      });

       await addDoc(collection(db, 'notifications'), {
                    type:         'approveCompletionRequest',
                    submittedAt:  serverTimestamp(),
                    employeeId:   req.lastUpdatedById,
                    employeeName: req.lastUpdatedByName,
                    client:       req.name,
                    read:         false,
                  });

      setPendingCompletionRequests(prev => prev.filter(r => r.id !== req.id));
      onSuccess(req.id, { status: 'completed', approvedForCompleting: true });
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoad(false); }
  };

  const handleRejectCompletion = async (req) => {
    if (!req) return;
    setLoad(true);
    try {
      await updateDoc(doc(db, 'requests', req.id), {
        status:                'inProgress',
        approvedForCompleting: null,
      });

       await addDoc(collection(db, 'notifications'), {
                    type:         'rejectCompletionRequest',
                    submittedAt:  serverTimestamp(),
                    employeeId:   req.lastUpdatedById,
                    employeeName: req.lastUpdatedByName,
                    client:       req.name,
                    read:         false,
                  });

      setPendingCompletionRequests(prev => prev.filter(r => r.id !== req.id));
      onSuccess(req.id, { status: 'inProgress', approvedForCompleting: null });
      onClose();

    } catch (err) { console.error(err); }
    finally { setLoad(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-green-500 py-1">
        {t("reviewRequest")}
        </h1>
        <hr className="text-gray-200 rounded-full w-full" />

        {loadingRequests ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-7 h-7 text-green-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pendingCompletionRequests.map((req) => (
              <div key={req.id} className="w-full bg-gray-50/20 border border-green-100 rounded-xl px-4 py-4">
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

                <div className="flex gap-2 justify-end mt-3">
                  <button onClick={() => handleConfirmCompletion(req)} disabled={load}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50">
                    {load && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {t("finish")}
                  </button>
                  <button onClick={() => handleRejectCompletion(req)} disabled={load}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200 flex items-center gap-2 disabled:opacity-60">
                    {load && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {t("reject")}
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

export default CompletionConfirmModal;