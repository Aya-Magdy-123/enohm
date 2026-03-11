import React, { useState, useEffect } from 'react';
import {
  FileText, FileCheck, Clock, Search, Filter, MapPin, Home, Phone,
  Loader2, X, Download, ChevronLeft, ChevronRight, CheckCircle2, User, MessageSquare,
  Circle, Plus, AlertTriangle
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, orderBy, query, serverTimestamp, addDoc, onSnapshot, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/Modal';
import AddRequestForm from '../../AddRequestForm';

/* ══════════════════════════════════════════
   STATUS META
══════════════════════════════════════════ */
const EMPLOYEE_STATUSES = ['contacted', 'inProgress', 'completed', 'paused'];

const serviceColors = {
  'construction':         { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  'finishing':        { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'renovation':        { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
  'homeReady': { bg: 'bg-teal-50',  text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500' },
};

const getServiceColor = (type) => {
  for (const key of Object.keys(serviceColors)) {
    if (type?.includes(key)) return serviceColors[key];
  }
  return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' };
};

const canAction = (status) =>
  !['approved', 'rejected', 'contacted', 'inProgress', 'completed', 'paused'].includes(status);

/* ══════════════════════════════════════════
   الصفحة الرئيسية
══════════════════════════════════════════ */
function Requests() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [activeTab, setActiveTab]           = useState('all');
  const [searchQuery, setSearchQuery]       = useState('');
  const [requests, setRequests]             = useState([]);
  const [employees, setEmployees]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showFilters, setShowFilters]       = useState(false);
  const [serviceFilter, setServiceFilter]   = useState('');
  const [qualityFilter, setQualityFilter]   = useState('');
  const [lightbox, setLightbox]             = useState({ open: false, photos: [], index: 0 });
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openRejectModal, setOpenRejectModal]     = useState(false);
  const [selectedRequest, setSelectedRequest]     = useState({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [openAddModal, setOpenAddModal]     = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /* ── rejection confirm modal (الأدمن يقرر) ── */
  const [openRejectionConfirm, setOpenRejectionConfirm] = useState(false);
  const [rejectionRequest, setRejectionRequest]         = useState(null);

  /* ══ STATUS_META بيتبنى هنا عشان يستخدم t() ══ */
  const STATUS_META = {
    pending:    { label: t('status.pending'),    badge: 'bg-orange-100 text-orange-600', notesKey: null },
    approved:   { label: t('status.approved'),   badge: 'bg-teal-100 text-teal-700',    notesKey: null },
    rejected:   { label: t('status.rejected'),   badge: 'bg-red-100 text-red-600',      notesKey: null },
    contacted:  { label: t('status.contacted'),  badge: 'bg-blue-100 text-blue-700',    notesKey: 'notesForContacted' },
    inProgress: { label: t('status.inProgress'), badge: 'bg-amber-100 text-amber-700',  notesKey: 'notesForInProgress' },
    completed:  { label: t('status.completed'),  badge: 'bg-green-100 text-green-700',  notesKey: 'notesForCompleted' },
  };

  const serviceTypesLangs= {
    
    construction: t("services.construction"),
    renovation: t("services.renovation"),
    finishing: t("services.finishing"),
    homeReady: t("services.homeReady")
  }

  const getMeta = (status) =>
    STATUS_META[status] || { label: status || '—', badge: 'bg-gray-100 text-gray-500', notesKey: null };

  /* ══ EmployeeNotes مع اسم الموظف لكل note ══ */
  const EmployeeNotes = ({ request }) => {
    const entries = EMPLOYEE_STATUSES
      .map(s => {
        const notesKey = STATUS_META[s]?.notesKey;
        const note     = notesKey ? request[notesKey] : null;
        const byName   = notesKey ? request[`${notesKey}ByName`] : null;
        return note ? { status: s, note, byName } : null;
      })
      .filter(Boolean);

    if (!entries.length) return null;

    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
          <MessageSquare className="w-3 h-3" /> ملاحظات الموظف
        </p>
        {entries.map(({ status, note, byName }) => {
          const meta = getMeta(status);
          return (
            <div key={status} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex gap-3 items-start">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap mt-0.5 flex-shrink-0 ${meta.badge}`}>
                {meta.label}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-600 leading-relaxed">{note}</p>
                {byName && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {byName}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ── fetch ── */
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt || null })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const snap = await getDocs(collection(db, 'employees'));
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  };

  /* ── listen لطلبات الرفض من الموظف ── */
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'requests'), where('approvedByAdmin', '==', false), where('status', '==', 'pendingForReject')),
      (snap) => {
        snap.docChanges().forEach(change => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = { id: change.doc.id, ...change.doc.data() };
            // حدّث الطلب في الـ state
            setRequests(prev =>
              prev.some(r => r.id === data.id)
                ? prev.map(r => r.id === data.id ? { ...r, ...data } : r)
                : prev
            );
          }
        });
      }
    );
    return unsub;
  }, []);

  useEffect(() => { fetchRequests(); fetchEmployees(); }, []);

  /* ── approve ── */
  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'requests', selectedRequest.id), {
        status:     'approved',
        approvedAt: new Date(),
      });
      setRequests(prev => prev.map(r =>
        r.id === selectedRequest.id ? { ...r, status: 'approved' } : r
      ));
      await addDoc(collection(db, 'notifications'), {
        type:        'approvedRequest',
        submittedAt: serverTimestamp(),
        isRead:      false,
        read:        false,
        serviceType: selectedRequest.serviceType,
      });
      setOpenApprovalModal(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  /* ── reject ── */
  const handleReject = async () => {
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'requests', selectedRequest.id), {
        status:     'rejected',
        rejectedAt: new Date(),
      });
      setRequests(prev => prev.map(r =>
        r.id === selectedRequest.id ? { ...r, status: 'rejected' } : r
      ));
      setOpenRejectModal(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  /* ── الأدمن يوافق على رفض الموظف ← rejected نهائي ── */
  const handleConfirmRejection = async () => {
    if (!rejectionRequest) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'requests', rejectionRequest.id), {
        status:          'rejected',
        rejectedAt:      serverTimestamp(),
        approvedByAdmin: true,
      });
      setRequests(prev => prev.map(r =>
        r.id === rejectionRequest.id ? { ...r, status: 'rejected', approvedByAdmin: true } : r
      ));
      setOpenRejectionConfirm(false);
      setRejectionRequest(null);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  /* ── الأدمن يرفض طلب الرفض ← يرجع approved ── */
  const handleDeclineRejection = async () => {
    if (!rejectionRequest) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'requests', rejectionRequest.id), {
        status:          'approved',
        approvedByAdmin: null,
      });
      setRequests(prev => prev.map(r =>
        r.id === rejectionRequest.id ? { ...r, status: 'approved', approvedByAdmin: null } : r
      ));
      setOpenRejectionConfirm(false);
      setRejectionRequest(null);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  /* ── lightbox ── */
  const openLightbox  = (photos, index) => setLightbox({ open: true, photos, index });
  const closeLightbox = () => setLightbox({ open: false, photos: [], index: 0 });
  const prevPhoto = () => setLightbox(p => ({ ...p, index: (p.index - 1 + p.photos.length) % p.photos.length }));
  const nextPhoto = () => setLightbox(p => ({ ...p, index: (p.index + 1) % p.photos.length }));
  const handleDownload = async (url) => {
    const res = await fetch(url); const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `photo-${Date.now()}.jpg`; link.click();
  };

  const openApprove = (r) => { setSelectedRequest(r); setSelectedEmployeeId(''); setOpenApprovalModal(true); };
  const openReject  = (r) => { setSelectedRequest(r); setOpenRejectModal(true); };

  /* ── counts ── */
  const cnt = (s) => requests.filter(r => r.status === s).length;
  /* طلبات الرفض المعلقة — approvedByAdmin === false */
  const pendingRejectionCount = requests.filter(r => r.approvedByAdmin === false).length;

  const stats = [
    { title: t('requests.totalRequests'),     value: requests.length, icon: FileText,  textColor: 'text-blue-500',   bgLight: 'bg-blue-50' },
    { title: t('requests.completedRequests'), value: cnt('completed'), icon: FileCheck, textColor: 'text-green-500',  bgLight: 'bg-green-50' },
    { title: t('requests.underReview'),       value: cnt('pending'),   icon: Clock,     textColor: 'text-orange-500', bgLight: 'bg-orange-50' },
  ];

  const tabs = [
    { key: 'all',        label: t('requests.all'),        count: requests.length },
    { key: 'pending',    label: t('status.pending'),      count: cnt('pending') },
    { key: 'approved',   label: t('status.approved'),     count: cnt('approved') },
    { key: 'contacted',  label: t('status.contacted'),    count: cnt('contacted') },
    { key: 'inProgress', label: t('status.inProgress'),   count: cnt('inProgress') },
    { key: 'completed',  label: t('status.completed'),    count: cnt('completed') },
    { key: 'rejected',   label: t('status.rejected'),     count: cnt('rejected') },
  ];

  const serviceOptions = [
    { key: '', label: t('requests.all') },
    { key: 'construction',         label: t('services.construction') },
    { key: 'finishing',        label: t('services.finishing') },
    { key: 'renovation',        label: t('services.renovation') },
    { key: 'homeReady', label: t('services.homeReady') },
  ];

  const qualityOptions = [
    { key: '', label: t('requests.all') },
    { key: 'standard',  label: t('quality.standard') },
    { key: 'plus',   label: t('quality.plus') },
    { key: 'premium', label: t('quality.premium') },
  ];

  const filteredRequests = requests.filter(r => {
    const matchTab     = activeTab === 'all' ? true : r.status === activeTab;
    const matchSearch  = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchService = serviceFilter ? r.serviceType?.includes(serviceFilter) : true;
    const matchQuality = qualityFilter ? r.qualityLevel?.includes(qualityFilter) : true;
    return matchTab && matchSearch && matchService && matchQuality;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── طلبات الرفض المعلقة — banner ── */}
      {pendingRejectionCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800 text-sm"> {t("pendingRejectionTitle")}  </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {pendingRejectionCount}     {t("pendingRejectionDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const first = requests.find(r => r.approvedByAdmin === false);
              if (first) { setRejectionRequest(first); setOpenRejectionConfirm(true); }
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition">
            {t("review")}
          </button>
        </div>
      )}

      {/* Stats */}
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

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
            <input
              type="text"
              placeholder={t('requests.search')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none`}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${showFilters || serviceFilter || qualityFilter ? 'bg-[#f2a057] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Filter className="w-4 h-4" /> {t('requests.filters')}
          </button>
          <button onClick={() => setOpenAddModal(true)}
            className="px-4 py-2.5 bg-[#f2a057] hover:bg-orange-600 rounded-xl text-sm font-semibold text-gray-50 transition">
            <Plus className="w-4 h-4 inline-block" />   {t("addNewRequest")}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">{t('requests.serviceType')}</p>
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
              <p className="text-xs font-semibold text-gray-500 mb-2">{t('requests.qualityLevel')}</p>
              <div className="flex flex-wrap gap-1.5">
                {qualityOptions.map(opt => (
                  <button key={opt.key} onClick={() => setQualityFilter(opt.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${qualityFilter === opt.key ? 'bg-blue-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
              className={`px-4 py-2.5 flex-1 rounded-xl text-sm font-semibold transition whitespace-nowrap ${activeTab === tab.key ? 'bg-[#f2a057] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
              {tab.label}
              <span className={`mx-1.5 px-1.5 py-0.5 rounded-md text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 text-[#f2a057] animate-spin" />
        </div>
      )}

      {/* Cards */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRequests.map((request) => {
            const svcColor = getServiceColor(request.serviceType);
            const meta     = getMeta(request.status);
            const hasPendingRejection = request.approvedByAdmin === false;

            return (
              <div key={request.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-300
                  ${hasPendingRejection ? 'border-amber-300' : 'border-gray-100'}`}>

                {/* Top Strip */}
                <div className={`${svcColor.bg} ${svcColor.border} border-b px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${svcColor.dot}`}></div>
                    <span className={`font-bold text-sm ${svcColor.text}`}>{serviceTypesLangs[request.serviceType]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* badge طلب رفض معلق */}
                    {hasPendingRejection && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />  {t("reviewRejectionRequest")}
                      </span>
                    )}
                    {request.lastUpdatedByName && (
                      <span className="text-xs px-2.5 py-1 flex items-center gap-1 text-gray-500 bg-white/80 rounded-lg border border-gray-100">
                        <User className="w-4 h-4" /> {request.lastUpdatedByName}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-sm">{request.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-blue-950 text-sm">{request.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {request.date?.toDate?.().toLocaleDateString(
                            i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'de' ? 'de-DE' : 'en-US'
                          )}
                        </p>
                      </div>
                    </div>
                    <a href={`tel:${request.phoneNumber}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium transition">
                      <Phone className="w-3.5 h-3.5" /> {request.phoneNumber}
                    </a>
                  </div>

                  <div className="border-t border-dashed border-gray-100" />

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t('requests.location')}</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{request.location || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Home className="w-3 h-3" /> {t('requests.area')}</p>
                      <p className="text-sm font-semibold text-gray-700">{request.area || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Circle className="w-3 h-3" /> {t('requests.qualityLevel')}</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{request.qualityLevel || '—'}</p>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-xs text-amber-600 font-semibold mb-1">{t('requests.notes')}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{request.notes}</p>
                    </div>
                  )}

                  {/* ملاحظات الموظف مع اسمه */}
                  <EmployeeNotes request={request} />

                  {request.photos?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-2">{t('requests.projectPhotos')} ({request.photos.length})</p>
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
                <div className="px-5 pb-4 flex items-center justify-end gap-2">
                  {/* زرار مراجعة الرفض المعلق */}
                  {hasPendingRejection && (
                    <button
                      onClick={() => { setRejectionRequest(request); setOpenRejectionConfirm(true); }}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition">
                      <AlertTriangle className="w-4 h-4" />   {t("reviewRejectionRequest")}
                    </button>
                  )}

                  {/* زراير الموافقة والرفض للـ pending */}
                  {canAction(request.status) && (
                    <>
                      <button onClick={() => openApprove(request)}
                        className="px-3 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openReject(request)}
                        className="px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
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
          <h3 className="text-lg font-bold text-gray-700 mb-1">{t('requests.noRequests')}</h3>
          <p className="text-sm text-gray-400">{t('requests.noRequestsDesc')}</p>
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

      {/* ══════ APPROVAL MODAL ══════ */}
      {openApprovalModal && (
        <Modal onClose={() => setOpenApprovalModal(false)}>
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-orange-600 py-1">  {t("approveRequest")}</h1>
            <hr className="text-gray-200 rounded-full w-full" />
            <div className="bg-blue-50 py-3 px-4 border-dashed border-blue-300 border rounded-lg">
              <span className="text-xs bg-orange-300 font-semibold rounded-full px-4">{selectedRequest.serviceType}</span>
              <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs"><User className="w-3.5 h-3.5 inline-block ml-1" />{t("clientName")} </h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">{selectedRequest.name}</p>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs"><Phone className="w-3.5 h-3.5 inline-block ml-1" />{t("phoneNumber")} </h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">{selectedRequest.phoneNumber}</p>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs"><MapPin className="w-3.5 h-3.5 inline-block ml-1" />{t("location")}</h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">{selectedRequest.location || '—'}</p>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs"><Home className="w-3.5 h-3.5 inline-block ml-1" />{t("area")}</h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">{selectedRequest.area} م<sup>2</sup></p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => setOpenApprovalModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                {t("cancel")}
              </button>
              <button onClick={handleApprove} disabled={submitting}
                className="px-10 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("send")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════ REJECT MODAL ══════ */}
      {openRejectModal && (
        <Modal onClose={() => setOpenRejectModal(false)}>
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-red-500 py-1">{t("rejectRequest")} </h1>
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
             {t("confirmRejectQuestion")} <span className="font-bold text-red-600">{t("rejectedStatus")}</span>.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpenRejectModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                {t("cancel")}
              </button>
              <button onClick={handleReject} disabled={submitting}
                className="px-8 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200 flex items-center gap-2 disabled:opacity-60">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                 {t("confirmReject")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════ REJECTION CONFIRM MODAL (الأدمن يقرر) ══════ */}
      {openRejectionConfirm && rejectionRequest && (
        <Modal onClose={() => { setOpenRejectionConfirm(false); setRejectionRequest(null); }}>
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-amber-500 py-1"> {t("reviewRejection")}</h1>
            <hr className="text-gray-200 rounded-full w-full" />

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">{rejectionRequest.name}</p>
                <p className="text-sm text-gray-500">{rejectionRequest.serviceType} — {rejectionRequest.location || '—'}</p>
                {rejectionRequest.rejectedByEmployeeId && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                   {t("rejectionRequestedByEmployee")}: {rejectionRequest.lastUpdatedByName || rejectionRequest.rejectedByEmployeeName}
                  </p>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center leading-relaxed">
             {t("employeeAskedReject")}
            </p>

            <div className="flex gap-2 justify-end">
              <button onClick={() => { setOpenRejectionConfirm(false); setRejectionRequest(null); }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                {t("later")}
              </button>
              <button onClick={handleDeclineRejection} disabled={submitting}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t("acceptRequest")}   
              </button>
              <button onClick={handleConfirmRejection} disabled={submitting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200 flex items-center gap-2 disabled:opacity-60">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
               {t("approveFinalRejection")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════ ADD REQUEST MODAL ══════ */}
      {openAddModal && (
        <Modal onClose={() => setOpenAddModal(false)}>
          <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 mb-3 border-r-orange-600 py-1"> {t("addNewRequest")} </h1>
          <hr className="text-gray-200 rounded-full w-full mb-4" />
          <AddRequestForm setShowSuccessModal={setShowSuccessModal} />
        </Modal>
      )}

    </div>
  );
}

export default Requests;