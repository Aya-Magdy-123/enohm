import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Filter, MapPin, Home, Phone,
  Loader2, X, Download, ChevronLeft, ChevronRight,
  RefreshCw, ClipboardEdit, MessageSquare
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, getDocs, doc, updateDoc, orderBy, query, where, serverTimestamp, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Modal from '../../components/Modal';
import { useTranslation } from 'react-i18next';

/* ══════════════════════════════════════════════
   حالات الطلب — built inside component to use t()
══════════════════════════════════════════════ */
const getStatusOptions = (t) => [
  { label: t('employeeRequests.status.contacted'),  value: 'contacted',  notesKey: 'notesForContacted',  badge: 'bg-blue-100 text-blue-700' },
  { label: t('employeeRequests.status.inProgress'), value: 'inProgress', notesKey: 'notesForInProgress', badge: 'bg-amber-100 text-amber-700' },
  { label: t('employeeRequests.status.completed'),  value: 'completed',  notesKey: 'notesForCompleted',  badge: 'bg-green-100 text-green-700' },
];

/* ألوان الخدمات */
const serviceColors = {
  'بناء':         { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  'إكساء':        { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'ترميم':        { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
  'تجهيز للعودة': { bg: 'bg-teal-50',  text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500' },
};
const getServiceColor = (type) => {
  for (const key of Object.keys(serviceColors)) if (type?.includes(key)) return serviceColors[key];
  return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' };
};

/* ══════════════════════════════════════════════
   مكوّن: عرض كل ملاحظات الموظف مع badge الحالة
══════════════════════════════════════════════ */
const EmployeeNotes = ({ request }) => {
  const { t } = useTranslation();
  const STATUS_OPTIONS = getStatusOptions(t);

  const entries = STATUS_OPTIONS
    .map(opt => {
      const note = request[opt.notesKey];
      return note ? { label: opt.label, badge: opt.badge, note } : null;
    })
    .filter(Boolean);

  if (!entries.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
        <MessageSquare className="w-3 h-3" /> {t('employeeRequests.card.myNotes')}
      </p>
      {entries.map(({ label, badge, note }) => (
        <div key={label} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex gap-3 items-start">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap mt-0.5 flex-shrink-0 ${badge}`}>
            {label}
          </span>
          <p className="text-sm text-gray-600 leading-relaxed">{note}</p>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════ */

function EmployeeRequests() {
  const { t,i18n } = useTranslation();

  const STATUS_OPTIONS = getStatusOptions(t);
  const getStatusOpt   = (val) => STATUS_OPTIONS.find(s => s.value === val);
  const getStatusBadge = (s)   => getStatusOpt(s)?.badge || (s === 'approved' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500');
  const getStatusLabel = (s)   => getStatusOpt(s)?.label || (s === 'approved' ? t('employeeRequests.status.approved') : s || '—');

  const [currentUser, setCurrentUser]     = useState(null);
  const [requests, setRequests]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeTab, setActiveTab]         = useState('all');
  const [showFilters, setShowFilters]     = useState(false);
  const [serviceFilter, setServiceFilter] = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [lightbox, setLightbox]           = useState({ open: false, photos: [], index: 0 });

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus]             = useState('');
  const [notes, setNotes]                     = useState('');
  const [submitting, setSubmitting]           = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user || null));
    return unsub;
  }, []);

  const fetchData = async (uid) => {
    if (!uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'requests'), where('employeeId', '==', uid), orderBy('createdAt', 'desc'))
      );
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt || null })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (currentUser) fetchData(currentUser.uid);
  }, [currentUser]);

  const openUpdate = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status || '');
    setNotes('');
    setOpenUpdateModal(true);
  };

  const handleUpdate = async () => {
    if (!newStatus || !selectedRequest) return;
    setSubmitting(true);
    try {
      const opt = getStatusOpt(newStatus);
      const notesKey = opt?.notesKey;
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
        ...(notesKey && notes.trim() ? { [notesKey]: notes.trim() } : {}),
      };
      await updateDoc(doc(db, 'requests', selectedRequest.id), updateData);
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, ...updateData } : r));
      setOpenUpdateModal(false);
      setNewStatus('');
      setNotes('');
      await addDoc(collection(db, 'notifications'), {
        type: 'updatedRequest',
        submittedAt: serverTimestamp(),
        employeeId: selectedRequest.employeeId,
        employeeName: selectedRequest.employeeName,
        status: newStatus,
        client: selectedRequest.name,
        isRead: false,
      });
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const openLightbox  = (photos, index) => setLightbox({ open: true, photos, index });
  const closeLightbox = () => setLightbox({ open: false, photos: [], index: 0 });
  const prevPhoto = () => setLightbox(p => ({ ...p, index: (p.index - 1 + p.photos.length) % p.photos.length }));
  const nextPhoto = () => setLightbox(p => ({ ...p, index: (p.index + 1) % p.photos.length }));
  const handleDownload = async (url) => {
    const res = await fetch(url); const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `photo-${Date.now()}.jpg`; link.click();
  };

  const totalCount      = requests.length;
  const contactedCount  = requests.filter(r => r.status === 'contacted').length;
  const inProgressCount = requests.filter(r => r.status === 'inProgress').length;
  const completedCount  = requests.filter(r => r.status === 'completed').length;

  const stats = [
    { title: t('employeeRequests.stats.total'),       value: totalCount,      textColor: 'text-blue-500',  bgLight: 'bg-blue-50' },
    { title: t('employeeRequests.stats.contacted'),   value: contactedCount,  textColor: 'text-blue-600',  bgLight: 'bg-blue-50' },
    { title: t('employeeRequests.stats.inProgress'),  value: inProgressCount, textColor: 'text-amber-500', bgLight: 'bg-amber-50' },
    { title: t('employeeRequests.stats.completed'),   value: completedCount,  textColor: 'text-green-500', bgLight: 'bg-green-50' },
  ];

  const tabs = [
    { key: 'all',        label: t('employeeRequests.tabs.all'),         count: totalCount },
    { key: 'contacted',  label: t('employeeRequests.tabs.contacted'),   count: contactedCount },
    { key: 'inProgress', label: t('employeeRequests.tabs.inProgress'),  count: inProgressCount },
    { key: 'completed',  label: t('employeeRequests.tabs.completed'),   count: completedCount },
  ];

  const serviceOptions = [
    { key: '', label: t('employeeRequests.all') },
    { key: 'بناء',         label: t('employeeRequests.services.building') },
    { key: 'إكساء',        label: t('employeeRequests.services.cladding') },
    { key: 'ترميم',        label: t('employeeRequests.services.renovation') },
    { key: 'تجهيز للعودة', label: t('employeeRequests.services.returnPrep') },
  ];

  const filteredRequests = requests.filter(r => {
    const matchTab    = activeTab === 'all' ? true : r.status === activeTab;
    const matchSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchService = serviceFilter ? r.serviceType?.includes(serviceFilter) : true;
    const matchStatus  = statusFilter  ? r.status === statusFilter : true;
    return matchTab && matchSearch && matchService && matchStatus;
  });

  const selectedStatusOpt = getStatusOpt(newStatus);

  return (
    <div className="space-y-6" dir="rtl">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">{stat.title}</p>
              <p className="text-3xl font-bold text-blue-950">{stat.value}</p>
            </div>
            <div className={`${stat.bgLight} p-3 rounded-xl`}>
              <FileText className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder={t('employeeRequests.search')}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${showFilters || serviceFilter || statusFilter ? 'bg-[#f2a057] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Filter className="w-4 h-4" /> {t('employeeRequests.filters')}
          </button>
          <button onClick={() => fetchData(currentUser?.uid)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-600 transition">
            <RefreshCw className="w-4 h-4" /> {t('employeeRequests.refresh')}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">{t('employeeRequests.serviceType')}</p>
              <div className="flex flex-wrap gap-1.5">
                {serviceOptions.map(opt => (
                  <button key={opt.key} onClick={() => setServiceFilter(opt.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${serviceFilter === opt.key ? 'bg-[#f2a057] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">{t('employeeRequests.requestStatus')}</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setStatusFilter('')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${statusFilter === '' ? 'bg-blue-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t('employeeRequests.all')}
                </button>
                {STATUS_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${statusFilter === opt.value ? 'bg-blue-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
        <div className="flex gap-1 w-full">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl flex-1 text-sm font-semibold transition whitespace-nowrap ${activeTab === tab.key ? 'bg-[#f2a057] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
              {tab.label}
              <span className={`mx-1.5 px-1.5 py-0.5 rounded-md text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="flex justify-center items-center py-16"><Loader2 className="w-8 h-8 text-[#f2a057] animate-spin" /></div>}

      {/* Cards */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRequests.map((request) => {
            const svcColor = getServiceColor(request.serviceType);
            return (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">

                {/* Top Strip */}
                <div className={`${svcColor.bg} ${svcColor.border} border-b px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${svcColor.dot}`}></div>
                    <span className={`font-bold text-sm ${svcColor.text}`}>{request.serviceType}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Name + phone */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-sm">{request.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-blue-950 text-sm">{request.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{request.date?.toDate?.().toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                    <a href={`tel:${request.phoneNumber}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium transition">
                      <Phone className="w-3.5 h-3.5" /> {request.phoneNumber}
                    </a>
                  </div>

                  <div className="border-t border-dashed border-gray-100" />

                  {/* Location + Area */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t('employeeRequests.card.location')}</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{request.location || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Home className="w-3 h-3" /> {t('employeeRequests.card.area')}</p>
                      <p className="text-sm font-semibold text-gray-700">{request.area || '—'}</p>
                    </div>
                  </div>

                  {/* Client notes */}
                  {request.notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-xs text-amber-600 font-semibold mb-1">{t('employeeRequests.card.clientNotes')}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{request.notes}</p>
                    </div>
                  )}

                  {/* Employee notes */}
                  <EmployeeNotes request={request} />

                  {/* Photos */}
                  {request.photos?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-2">{t('employeeRequests.card.photos')} ({request.photos.length})</p>
                      <div className="flex gap-2 flex-wrap">
                        {request.photos.map((url, idx) => (
                          <div key={idx} onClick={() => openLightbox(request.photos, idx)}
                            className="relative group cursor-zoom-in w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-200">
                            <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition duration-200" alt="" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition duration-200 flex items-center justify-center">
                              <Search className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {request.status !== 'completed' && (
                  <div className="px-5 pb-4 flex justify-end">
                    <button onClick={() => openUpdate(request)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition shadow-sm">
                      <ClipboardEdit className="w-4 h-4" /> {t('employeeRequests.card.updateStatus')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredRequests.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">{t('employeeRequests.empty.title')}</h3>
          <p className="text-sm text-gray-400">
            {activeTab === 'all'
              ? t('employeeRequests.empty.allDesc')
              : `${t('employeeRequests.empty.tabDesc')} "${tabs.find(tb => tb.key === activeTab)?.label}"`
            }
          </p>
        </div>
      )}

      {/* Lightbox */}
      {lightbox.open && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"><X className="w-5 h-5" /></button>
          <button onClick={e => { e.stopPropagation(); handleDownload(lightbox.photos[lightbox.index]); }} className="absolute top-4 left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"><Download className="w-5 h-5" /></button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xs bg-white/10 px-3 py-1 rounded-full">{lightbox.index + 1} / {lightbox.photos.length}</div>
          {lightbox.photos.length > 1 && <button onClick={e => { e.stopPropagation(); prevPhoto(); }} className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"><ChevronLeft className="w-5 h-5" /></button>}
          <img src={lightbox.photos[lightbox.index]} className="max-w-[88vw] max-h-[82vh] rounded-2xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} alt="zoom" />
          {lightbox.photos.length > 1 && <button onClick={e => { e.stopPropagation(); nextPhoto(); }} className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"><ChevronRight className="w-5 h-5" /></button>}
          {lightbox.photos.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {lightbox.photos.map((url, idx) => (
                <img key={idx} src={url} onClick={e => { e.stopPropagation(); setLightbox(p => ({ ...p, index: idx })); }}
                  className={`w-12 h-12 rounded-lg object-cover cursor-pointer transition ${idx === lightbox.index ? 'ring-2 ring-[#f2a057] opacity-100' : 'opacity-40 hover:opacity-70'}`} alt="" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── UPDATE MODAL ── */}
      {openUpdateModal && selectedRequest && (
        <Modal onClose={() => setOpenUpdateModal(false)}>
          <div className="flex flex-col gap-3" dir={i18n.language==="ar"? "rtl":"ltr"}>
            <h1 className={`font-bold text-xl px-2 text-blue-950 ${i18n.language==="ar"? "border-r-4 border-r-orange-500":"border-l-4 border-l-orange-500"}  py-1`}>
              {t('employeeRequests.modal.title')}
            </h1>
            <hr className="text-gray-200 rounded-full w-full" />

            <div className="bg-blue-50 border border-dashed border-blue-200 rounded-xl px-4 py-3 justify-between flex flex-wrap gap-4">
              <div><p className="text-xs text-gray-400 mb-0.5">{t('employeeRequests.modal.client')}</p><p className="text-sm font-bold text-blue-950">{selectedRequest.name}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">{t('employeeRequests.modal.serviceType')}</p><p className="text-sm font-bold text-blue-950">{selectedRequest.serviceType}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">{t('employeeRequests.modal.location')}</p><p className="text-sm font-bold text-blue-950">{selectedRequest.location || '—'}</p></div>
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
                      newStatus === opt.value ? 'bg-blue-950 text-white border-blue-950' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
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
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder={`${t('employeeRequests.modal.notesPlaceholder')} "${selectedStatusOpt?.label}"...`}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none" />
              </div>
            )}

            <div className="flex gap-2 justify-end mt-1">
              <button onClick={() => setOpenUpdateModal(false)}
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
      )}

    </div>
  );
}

export default EmployeeRequests;