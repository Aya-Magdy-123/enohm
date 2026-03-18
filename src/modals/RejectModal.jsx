import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Modal from '../components/Modal';
import { useTranslation } from 'react-i18next';

function RejectModal({ selectedRequest, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'requests', selectedRequest.id), {
        status:     'rejected',
        rejectedAt: new Date(),
      });
      onSuccess(selectedRequest.id, { status: 'rejected' });
      onClose();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-red-500 py-1">
          {t('rejectRequest')}
        </h1>
        <hr className="text-gray-200 rounded-full w-full" />
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 font-bold text-lg">{selectedRequest.name?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-bold text-gray-800">{selectedRequest.name}</p>
            <p className="text-sm text-gray-500">{selectedRequest.serviceType} — {selectedRequest.phoneNumber}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 text-center">
          {t('confirmRejectQuestion')} <span className="font-bold text-red-600">{t('rejectedStatus')}</span>.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            {t('cancel')}
          </button>
          <button
            onClick={handleReject}
            disabled={submitting}
            className="px-8 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200 flex items-center gap-2 disabled:opacity-60">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('confirmReject')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default RejectModal;