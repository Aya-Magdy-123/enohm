import React, { useState } from 'react';
import { User, Phone, MapPin, Home, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Modal from '../components/Modal';
import { useTranslation } from 'react-i18next';

function ApprovalModal({ selectedRequest, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'requests', selectedRequest.id), {
        status:     'approved',
        approvedAt: new Date(),
      });
      await addDoc(collection(db, 'notifications'), {
        type:        'approvedRequest',
        submittedAt: serverTimestamp(),
        read:        false,
        serviceType: selectedRequest.serviceType,
      });
      onSuccess(selectedRequest.id, { status: 'approved' });
      onClose();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-orange-600 py-1">
          {t('approveRequest')}
        </h1>
        <hr className="text-gray-200 rounded-full w-full" />
        <div className="bg-blue-50 py-3 px-4 border-dashed border-blue-300 border rounded-lg">
          <span className="text-xs bg-orange-300 font-semibold rounded-full px-4">
            {selectedRequest.serviceType}
          </span>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
            <div className="flex flex-col items-start">
              <h3 className="text-gray-500 text-xs">
                <User className="w-3.5 h-3.5 inline-block ml-1" />{t('clientName')}
              </h3>
              <p className="font-semibold text-sm text-blue-950 mt-0.5">{selectedRequest.name}</p>
            </div>
            <div className="flex flex-col items-start">
              <h3 className="text-gray-500 text-xs">
                <Phone className="w-3.5 h-3.5 inline-block ml-1" />{t('phoneNumber')}
              </h3>
              <p className="font-semibold text-sm text-blue-950 mt-0.5">{selectedRequest.phoneNumber}</p>
            </div>
            <div className="flex flex-col items-start">
              <h3 className="text-gray-500 text-xs">
                <MapPin className="w-3.5 h-3.5 inline-block ml-1" />{t('location')}
              </h3>
              <p className="font-semibold text-sm text-blue-950 mt-0.5">{selectedRequest.location || '—'}</p>
            </div>
            <div className="flex flex-col items-start">
              <h3 className="text-gray-500 text-xs">
                <Home className="w-3.5 h-3.5 inline-block ml-1" />{t('area')}
              </h3>
              <p className="font-semibold text-sm text-blue-950 mt-0.5">
                {selectedRequest.area} م<sup>2</sup>
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            {t('cancel')}
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="px-10 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('send')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ApprovalModal;