import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import Modal from '../components/Modal';
import { useTranslation } from 'react-i18next';

function PermissionModal({ employees, requests, onClose }) {
  const { t } = useTranslation();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedRequests, setSelectedRequests]     = useState([]);
  const [sending, setSending]                       = useState(false);

  const serviceTypesLangs = {
    construction: t('services.construction'),
    renovation:   t('services.renovation'),
    finishing:    t('services.finishing'),
    homeReady:    t('services.homeReady'),
  };
  const qualityLevelsLangs = {
    standard: t('quality.standard'),
    plus:     t('quality.plus'),
    premium:  t('quality.premium'),
  };

  const handleExceptEmployees = async () => {
    if (!selectedEmployeeId || selectedRequests.length === 0) return;
    setSending(true);
    try {
      for (const reqId of selectedRequests) {
        await updateDoc(doc(db, 'requests', reqId), {
          permissionedEmployees: arrayUnion(selectedEmployeeId),
        });
      }
      onClose();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const toggleRequest = (id) => {
    setSelectedRequests(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-orange-600 py-1">
          {t('addPermission')}
        </h1>
        <hr className="text-gray-200 rounded-full mb-2 w-full" />

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 font-semibold">{t('selectEmployee')}</label>
          <select
            value={selectedEmployeeId}
            onChange={e => setSelectedEmployeeId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">{t('choose')}</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <h2 className="text-sm font-semibold text-gray-700 mt-2">{t('requestsExcept')}</h2>

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {requests.map(request => (
            <div key={request.id}
              onClick={() => toggleRequest(request.id)}
              className={`border rounded-lg p-3 cursor-pointer transition ${
                selectedRequests.includes(request.id)
                  ? 'bg-orange-100 border-orange-400'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs">{t('clientName')}</h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">{request.name}</p>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs">{t('serviceType')}</h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">{serviceTypesLangs[request.serviceType]}</p>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs">{t('qualityLevel')}</h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">{qualityLevelsLangs[request.qualityLevel]}</p>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs">{t('area')}</h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">{request.area}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3 justify-end">
          <button onClick={onClose}
            className="px-5 py-2 cursor-pointer rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 transition">
            {t('cancel')}
          </button>
          <button
            disabled={selectedRequests.length === 0 || sending}
            onClick={handleExceptEmployees}
            className={`px-10 py-2 rounded-lg text-sm font-bold transition ${
              selectedRequests.length === 0 || sending
                ? 'bg-gray-300 text-gray-500'
                : 'bg-blue-950 hover:bg-blue-900 text-white'
            }`}>
            {sending ? t('sending') : t('send')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PermissionModal;