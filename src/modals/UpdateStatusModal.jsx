import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Modal from '../components/Modal';
import { useTranslation } from 'react-i18next';
import EmployeeNotes from '../components/EmployeeNotes';

const getStatusOptions = (t) => [
  { label: t('employeeRequests.status.contacted'),  value: 'contacted',  notesKey: 'notesForContacted',  badge: 'bg-blue-100 text-blue-700' },
  { label: t('employeeRequests.status.inProgress'), value: 'inProgress', notesKey: 'notesForInProgress', badge: 'bg-amber-100 text-amber-700' },
  { label: t('employeeRequests.status.completed'),  value: 'completed',  notesKey: 'notesForCompleted',  badge: 'bg-green-100 text-green-700' },
];

const getStatusBadge = (s) => {
  if (s === 'pending')   return 'bg-gray-100 text-gray-600';
  if (s === 'approved')  return 'bg-teal-100 text-teal-700';
  if (s === 'rejected')  return 'bg-red-100 text-red-600';
  if (s === 'contacted') return 'bg-blue-100 text-blue-700';
  if (s === 'inProgress') return 'bg-amber-100 text-amber-700';
  if (s === 'completed') return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-500';
};

function UpdateStatusModal({ selectedRequest, currentUser, onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const STATUS_OPTIONS  = getStatusOptions(t);
  const getStatusOpt    = (val) => STATUS_OPTIONS.find(s => s.value === val);

  const getStatusLabel = (s) => {
    if (s === 'pending')   return t('status.pending');
    if (s === 'approved')  return t('employeeRequests.status.approved');
    if (s === 'rejected')  return t('status.rejected');
    return getStatusOpt(s)?.label || s || '—';
  };

  const [newStatus, setNewStatus]   = useState(selectedRequest.status || '');
  const [notes, setNotes]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedStatusOpt = getStatusOpt(newStatus);

  const handleUpdate = async () => {
    if (!newStatus || !selectedRequest) return;
    setSubmitting(true);
    try {
      const opt      = getStatusOpt(newStatus);
      const notesKey = opt?.notesKey;
      let updateData;

      if (newStatus === 'completed') {
        updateData = {
          status:                'pendingForCompleted',
          approvedForCompleting: false,
          updatedAt:             new Date(),
          lastUpdatedById:       currentUser.uid,
          lastUpdatedByName:     'admin',
          ...(notesKey && notes.trim() ? {
            [notesKey]:            notes.trim(),
            [`${notesKey}ByName`]: 'admin',
          } : {}),
        };
      } else {
        updateData = {
          status:            newStatus,
          updatedAt:         new Date(),
          lastUpdatedById:   currentUser.uid,
          lastUpdatedByName: 'admin',
          ...(notesKey && notes.trim() ? {
            [notesKey]:            notes.trim(),
            [`${notesKey}ByName`]: 'admin',
          } : {}),
        };
      }

      await updateDoc(doc(db, 'requests', selectedRequest.id), updateData);
      await addDoc(collection(db, 'notifications'), {
        type:         'updatedRequest',
        submittedAt:  serverTimestamp(),
        employeeId:   currentUser.uid,
        employeeName: 'admin',
        status:       newStatus,
        client:       selectedRequest.name,
        read:         false,
      });

      onSuccess(selectedRequest.id, updateData);
      onClose();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-3" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <h1 className={`font-bold text-xl px-2 text-blue-950 ${i18n.language === 'ar' ? 'border-r-4 border-r-orange-500' : 'border-l-4 border-l-orange-500'} py-1`}>
          {t('employeeRequests.modal.title')}
        </h1>
        <hr className="text-gray-200 rounded-full w-full" />

        <div className="bg-blue-50 border border-dashed border-blue-200 rounded-xl px-4 py-3 justify-between flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t('employeeRequests.modal.client')}</p>
            <p className="text-sm font-bold text-blue-950">{selectedRequest.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t('employeeRequests.modal.serviceType')}</p>
            <p className="text-sm font-bold text-blue-950">{selectedRequest.serviceType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t('employeeRequests.modal.location')}</p>
            <p className="text-sm font-bold text-blue-950">{selectedRequest.location || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t('employeeRequests.modal.currentStatus')}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${getStatusBadge(selectedRequest.status)}`}>
              {getStatusLabel(selectedRequest.status)}
            </span>
          </div>
        </div>

        <EmployeeNotes request={selectedRequest} />

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            {t('employeeRequests.modal.newStatus')} <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value}
                onClick={() => { setNewStatus(opt.value); setNotes(''); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                  newStatus === opt.value
                    ? 'bg-blue-950 text-white border-blue-950'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {newStatus && (
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              {t('employeeRequests.modal.notes')} — {selectedStatusOpt?.label}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder={`${t('employeeRequests.modal.notesPlaceholder')} "${selectedStatusOpt?.label}"...`}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
            />
          </div>
        )}

        <div className="flex gap-2 justify-end mt-1">
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            {t('employeeRequests.modal.cancel')}
          </button>
          <button onClick={handleUpdate} disabled={!newStatus || submitting}
            className="px-8 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('employeeRequests.modal.save')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default UpdateStatusModal;