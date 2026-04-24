import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, FileCheck, Clock, Search, Filter, MapPin, Home, Phone,
  Loader2, X, Download, ChevronLeft, ChevronRight, CheckCircle2, User,
  Circle, Plus, AlertTriangle, ClipboardEdit, CheckCircle,
  Mail
} from 'lucide-react';
import { auth, db } from '../../firebase';
import {
  collection, getCountFromServer, getDocs, doc,
  orderBy, query, where, limit, startAfter,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

/* ── modals ── */
import ApprovalModal        from '../../modals/ApprovalModal';
import RejectModal          from '../../modals/RejectModal';
import RejectionConfirmModal from '../../modals/RejectionConfirmModal';
import CompletionConfirmModal from '../../modals/CompletionConfirmModal';
import UpdateStatusModal    from '../../modals/UpdateStatusModal';
import PermissionModal      from '../../modals/PermissionModal';
import AddRequestModal      from '../../modals/AddRequestModal';

/* ── shared component ── */
import EmployeeNotes from '../../components/EmployeeNotes';

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */

function SuccessModal({ isOpen, onClose, isRTL }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center text-center gap-4 animate-[fadeInScale_0.3s_ease-out]"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center shadow-inner">
          <CheckCircle className="w-11 h-11 text-[#f2a057]" strokeWidth={1.8} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-extrabold text-blue-950">
            {isRTL ? 'تم إرسال طلبك بنجاح!' : 'Request Sent Successfully!'}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isRTL
              ? 'شكراً لتواصلك معنا، سيقوم فريقنا بالتواصل معك في أقرب وقت ممكن.'
              : 'Thank you for reaching out. Our team will contact you as soon as possible.'}
          </p>
        </div>

        {/* Divider */}
        <hr className="w-16 h-[3px] bg-yellow-500 border-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-1 px-8 py-2.5 bg-[#f2a057] hover:bg-orange-600 text-white font-bold rounded-lg shadow-md transition text-sm"
        >
          {isRTL ? 'حسناً' : 'OK'}
        </button>
      </div>

      {/* Keyframe animation via style tag */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

const PAGE_SIZE = 9;

const serviceColors = {
  construction: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  finishing:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  renovation:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
  homeReady:    { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500' },
};
const getServiceColor = (type) => {
  for (const key of Object.keys(serviceColors)) {
    if (type?.includes(key)) return serviceColors[key];
  }
  return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' };
};

/* pending → يظهر زراير approve/reject */
const canAction = (status) =>
  !['approved', 'rejected', 'contacted', 'inProgress', 'completed', 'paused', 'pendingForReject', 'pendingForCompleted'].includes(status);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
function Requests() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  /* ── auth ── */
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (u) setCurrentUser(u); });
    return unsub;
  }, []);

  /* ── data ── */
  const [requests, setRequests]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);

  /* ── pagination ── */
  const [currentPage, setCurrentPage]       = useState(1);
  const [totalCount, setTotalCount]         = useState(0);
  const [cursors, setCursors]               = useState({}); // { pageNum: lastDocSnapshot }
  const [activeTab, setActiveTab]           = useState('all');

  /* ── filters / search ── */
  const [searchQuery, setSearchQuery]       = useState('');
  const [showFilters, setShowFilters]       = useState(false);
  const [serviceFilter, setServiceFilter]   = useState('');
  const [qualityFilter, setQualityFilter]   = useState('');

  /* ── lightbox ── */
  const [lightbox, setLightbox] = useState({ open: false, photos: [], index: 0 });

  /* ── modal visibility ── */
  const [openApprovalModal, setOpenApprovalModal]         = useState(false);
  const [openRejectModal, setOpenRejectModal]             = useState(false);
  const [openRejectionConfirm, setOpenRejectionConfirm]   = useState(false);
  const [openCompletionConfirm, setOpenCompletionConfirm] = useState(false);
  const [openUpdateModal, setOpenUpdateModal]             = useState(false);
  const [openPermissionModal, setOpenPermissionModal]     = useState(false);
  const [openAddModal, setOpenAddModal]                   = useState(false);
  const [showSuccessModal, setShowSuccessModal]           = useState(false);

  /* ── selected request (shared across modals) ── */
  const [selectedRequest, setSelectedRequest] = useState(null);

  /* ── banner counts (server) ── */
  const [pendingRejectionCount, setPendingRejectionCount]   = useState(0);
  const [pendingCompletionCount, setPendingCompletionCount] = useState(0);

  /* ── tab counts ── */
  const [tabCounts, setTabCounts] = useState({
    all: 0, pending: 0, approved: 0,
    contacted: 0, inProgress: 0, completed: 0, rejected: 0,
  });

  /* ══════════════════════════════════════════
     STATUS META (depends on t())
  ══════════════════════════════════════════ */
  const STATUS_META = {
    pending:            { label: t('status.pending'),    badge: 'bg-orange-100 text-orange-600' },
    approved:           { label: t('status.approved'),   badge: 'bg-teal-100 text-teal-700' },
    rejected:           { label: t('status.rejected'),   badge: 'bg-red-100 text-red-600' },
    contacted:          { label: t('status.contacted'),  badge: 'bg-blue-100 text-blue-700' },
    inProgress:         { label: t('status.inProgress'), badge: 'bg-amber-100 text-amber-700' },
    completed:          { label: t('status.completed'),  badge: 'bg-green-100 text-green-700' },
    pendingForReject:   { label: t('status.pendingForReject'), badge: 'bg-amber-100 text-amber-700' },
    pendingForCompleted:{ label: t('status.pendingForCompleted'),   badge: 'bg-teal-100 text-teal-600' },
  };
  const getMeta = (status) =>
    STATUS_META[status] || { label: status || '—', badge: 'bg-gray-100 text-gray-500' };

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

  /* ══════════════════════════════════════════
     FETCH HELPERS
  ══════════════════════════════════════════ */

  /** بناء الـ constraints بناء على التاب والفلاتر */
  const buildConstraints = useCallback((tab, svcFilter, qlFilter) => {
    const c = [];
    if (tab !== 'all')  c.push(where('status', '==', tab));
    if (svcFilter)      c.push(where('serviceType', '==', svcFilter));
    if (qlFilter)       c.push(where('qualityLevel', '==', qlFilter));
    return c;
  }, []);

  /** جيب عدد كل الـ tabs + banner counts */
  const fetchCounts = useCallback(async () => {
    try {
      const statuses = ['pending', 'approved', 'contacted', 'inProgress', 'completed', 'rejected'];
      const [allSnap, ...statusSnaps] = await Promise.all([
        getCountFromServer(collection(db, 'requests')),
        ...statuses.map(s =>
          getCountFromServer(query(collection(db, 'requests'), where('status', '==', s)))
        ),
      ]);
      const counts = { all: allSnap.data().count };
      statuses.forEach((s, i) => { counts[s] = statusSnaps[i].data().count; });
      setTabCounts(counts);
      setTotalCount(counts.all);

      /* banner */
      const [rejSnap, compSnap] = await Promise.all([
        getCountFromServer(query(
          collection(db, 'requests'),
          where('approvedByAdmin', '==', false),
          where('status', '==', 'pendingForReject')
        )),
        getCountFromServer(query(
          collection(db, 'requests'),
          where('approvedForCompleting', '==', false),
          where('status', '==', 'pendingForCompleted')
        )),
      ]);
      setPendingRejectionCount(rejSnap.data().count);
      setPendingCompletionCount(compSnap.data().count);
    } catch (err) { console.error(err); }
  }, []);

  /** جيب صفحة معينة */
  const fetchPage = useCallback(async (page, tab, svcFilter, qlFilter, cursorsMap) => {
    setLoading(true);
    try {
      const constraints = buildConstraints(tab, svcFilter, qlFilter);

      /* عدد هذه الـ query تحديداً */
      const countSnap = await getCountFromServer(
        query(collection(db, 'requests'), ...constraints)
      );
      setTotalCount(countSnap.data().count);

      /* بناء الـ query مع pagination */
      const baseQ = query(
        collection(db, 'requests'),
        ...constraints,
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE),
      );

      let pageQuery = baseQ;
      if (page > 1 && cursorsMap[page - 1]) {
        pageQuery = query(
          collection(db, 'requests'),
          ...constraints,
          orderBy('createdAt', 'desc'),
          startAfter(cursorsMap[page - 1]),
          limit(PAGE_SIZE),
        );
      }

      const snap = await getDocs(pageQuery);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt || null }));
      setRequests(docs);

      /* حفظ الـ cursor للصفحة الحالية */
      if (snap.docs.length > 0) {
        const lastDoc = snap.docs[snap.docs.length - 1];
        setCursors(prev => ({ ...prev, [page]: lastDoc }));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [buildConstraints]);

  /* fetch employees مرة واحدة */
  const fetchEmployees = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'employees'));
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  }, []);

  /* initial load */
  useEffect(() => {
    fetchCounts();
    fetchEmployees();
  }, [fetchCounts, fetchEmployees]);

  /* كل ما يتغير التاب أو الفلتر → reset pagination */
  useEffect(() => {
    setCursors({});
    setCurrentPage(1);
    fetchPage(1, activeTab, serviceFilter, qualityFilter, {});
  }, [activeTab, serviceFilter, qualityFilter, fetchPage]);

  /* ── pagination navigation ── */
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchPage(page, activeTab, serviceFilter, qualityFilter, cursors);
  };

  /* ══════════════════════════════════════════
     LIGHTBOX
  ══════════════════════════════════════════ */
  const openLightbox  = (photos, index) => setLightbox({ open: true, photos, index });
  const closeLightbox = () => setLightbox({ open: false, photos: [], index: 0 });
  const prevPhoto = () => setLightbox(p => ({ ...p, index: (p.index - 1 + p.photos.length) % p.photos.length }));
  const nextPhoto = () => setLightbox(p => ({ ...p, index: (p.index + 1) % p.photos.length }));
  const handleDownload = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `photo-${Date.now()}.jpg`;
    link.click();
  };

  /* ══════════════════════════════════════════
     MODAL SUCCESS CALLBACKS
     (تحديث الـ local state بدون re-fetch)
  ══════════════════════════════════════════ */
  const handleModalSuccess = (reqId, updatedFields) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, ...updatedFields } : r));
    fetchCounts(); /* update counters */
  };

  /* ══════════════════════════════════════════
     CLIENT-SIDE SEARCH FILTER
     (بيشتغل على الـ 9 docs الحالية بس)
  ══════════════════════════════════════════ */
  const filteredRequests = searchQuery.trim()
    ? requests.filter(r =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : requests;

  /* ══════════════════════════════════════════
     TABS CONFIG
  ══════════════════════════════════════════ */
  const tabs = [
    { key: 'all',        label: t('requests.all'),      count: tabCounts.all },
    { key: 'pending',    label: t('status.pending'),    count: tabCounts.pending },
    { key: 'approved',   label: t('status.approved'),   count: tabCounts.approved },
    { key: 'contacted',  label: t('status.contacted'),  count: tabCounts.contacted },
    { key: 'inProgress', label: t('status.inProgress'), count: tabCounts.inProgress },
    { key: 'completed',  label: t('status.completed'),  count: tabCounts.completed },
    { key: 'rejected',   label: t('status.rejected'),   count: tabCounts.rejected },
  ];

  const stats = [
    { title: t('requests.totalRequests'),     value: tabCounts.all,       icon: FileText,  textColor: 'text-blue-500',   bgLight: 'bg-blue-50' },
    { title: t('requests.completedRequests'), value: tabCounts.completed, icon: FileCheck, textColor: 'text-green-500',  bgLight: 'bg-green-50' },
    { title: t('requests.underReview'),       value: tabCounts.pending,   icon: Clock,     textColor: 'text-orange-500', bgLight: 'bg-orange-50' },
  ];

  const serviceOptions = [
    { key: '', label: t('requests.all') },
    { key: 'construction', label: t('services.construction') },
    { key: 'finishing',    label: t('services.finishing') },
    { key: 'renovation',   label: t('services.renovation') },
    { key: 'homeReady',    label: t('services.homeReady') },
  ];
  const qualityOptions = [
    { key: '', label: t('requests.all') },
    { key: 'standard', label: t('quality.standard') },
    { key: 'plus',     label: t('quality.plus') },
    { key: 'premium',  label: t('quality.premium') },
  ];

  /* ══════════════════════════════════════════
     PAGINATION UI HELPER
  ══════════════════════════════════════════ */
  const getPaginationPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3)       pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Banner: pending rejection ── */}
      {pendingRejectionCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800 text-sm">{t('pendingRejectionTitle')}</p>
              <p className="text-xs text-amber-600 mt-0.5">{pendingRejectionCount} {t('pendingRejectionDesc')}</p>
            </div>
          </div>
          <button onClick={() => setOpenRejectionConfirm(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition">
            {t('review')}
          </button>
        </div>
      )}

      {/* ── Banner: pending completion ── */}
      {pendingCompletionCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-sm">طلبات إنهاء بانتظار موافقتك</p>
              <p className="text-xs text-green-600 mt-0.5">{pendingCompletionCount} طلب إنهاه موظف ويحتاج قرارك</p>
            </div>
          </div>
          <button onClick={() => setOpenCompletionConfirm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition">
            {t('review')}
          </button>
        </div>
      )}

      {/* ── Stats ── */}
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

      {/* ── Search & Filters ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
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
            <Plus className="w-4 h-4 inline-block" /> {t('addNewRequest')}
          </button>
          <button onClick={() => setOpenPermissionModal(true)}
            className="px-4 py-2.5 bg-blue-950 hover:bg-blue-900 rounded-xl text-sm font-semibold text-gray-50 transition">
            <Plus className="w-4 h-4 inline-block" /> {t('addPermission')}
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

      {/* ── Tabs ── */}
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

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 text-[#f2a057] animate-spin" />
        </div>
      )}

      {/* ── Cards ── */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRequests.map((request) => {
            const svcColor             = getServiceColor(request.serviceType);
            const meta                 = getMeta(request.status);
            const hasPendingRejection  = request.approvedByAdmin === false;
            const isPending            = request.status === 'pending';

            return (
              <div key={request.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-300 ${hasPendingRejection ? 'border-amber-300' : 'border-gray-100'}`}>

                {/* Top strip */}
                <div className={`${svcColor.bg} ${svcColor.border} border-b px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${svcColor.dot}`} />
                    <span className={`font-bold text-sm ${svcColor.text}`}>{serviceTypesLangs[request.serviceType]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasPendingRejection && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {t('reviewRejectionRequest')}
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
                    <div className='flex flex-col gap-1'>
                    <a href={`tel:${request.phoneNumber}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium transition">
                      <Phone className="w-3.5 h-3.5" /> {request.phoneNumber}
                    </a>

                    <a href={`mailto:${request.email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium transition">
                      <Mail className="w-3.5 h-3.5" /> {request?.email || "-"}{" "}
                    </a>
                    </div>

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
                      <p className="text-sm font-semibold text-gray-700 truncate">{qualityLevelsLangs[request.qualityLevel] || '—'}</p>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-xs text-amber-600 font-semibold mb-1">{t('requests.notes')}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{request.notes}</p>
                    </div>
                  )}

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
                  {hasPendingRejection && (
                    <button onClick={() => setOpenRejectionConfirm(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition">
                      <AlertTriangle className="w-4 h-4" /> {t('reviewRejectionRequest')}
                    </button>
                  )}
                  {canAction(request.status) && (
                    <>
                      <button onClick={() => { setSelectedRequest(request); setOpenApprovalModal(true); }}
                        className="px-3 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedRequest(request); setOpenRejectModal(true); }}
                        className="px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {!isPending && request.status !== 'completed' && request.status !== 'rejected' && (
                    <button onClick={() => { setSelectedRequest(request); setOpenUpdateModal(true); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition shadow-sm">
                      <ClipboardEdit className="w-4 h-4" /> {t('employeeRequests.card.updateStatus')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filteredRequests.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">{t('requests.noRequests')}</h3>
          <p className="text-sm text-gray-400">{t('requests.noRequestsDesc')}</p>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-500">
            {t('pagination.showing') || 'عرض'}
            {' '}<span className="font-bold text-blue-950">{(currentPage - 1) * PAGE_SIZE + 1}</span>
            {' '}—{' '}
            <span className="font-bold text-blue-950">{Math.min(currentPage * PAGE_SIZE, totalCount)}</span>
            {' '}{t('pagination.of') || 'من'}
            {' '}<span className="font-bold text-blue-950">{totalCount}</span>
          </p>

          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {getPaginationPages().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
              ) : (
                <button key={p} onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                    p === currentPage
                      ? 'bg-[#f2a057] text-white shadow-sm'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {p}
                </button>
              )
            )}

            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox.open && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"><X className="w-5 h-5" /></button>
          <button onClick={e => { e.stopPropagation(); handleDownload(lightbox.photos[lightbox.index]); }} className="absolute top-4 left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"><Download className="w-5 h-5" /></button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xs bg-white/10 px-3 py-1 rounded-full">
            {lightbox.index + 1} / {lightbox.photos.length}
          </div>
          {lightbox.photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prevPhoto(); }} className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <img src={lightbox.photos[lightbox.index]} className="max-w-[88vw] max-h-[82vh] rounded-2xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} alt="zoom" />
          {lightbox.photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); nextPhoto(); }} className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {lightbox.photos.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {lightbox.photos.map((url, idx) => (
                <img key={idx} src={url}
                  onClick={e => { e.stopPropagation(); setLightbox(p => ({ ...p, index: idx })); }}
                  className={`w-12 h-12 rounded-lg object-cover cursor-pointer transition ${idx === lightbox.index ? 'ring-2 ring-[#f2a057] opacity-100' : 'opacity-40 hover:opacity-70'}`}
                  alt="" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ MODALS ══ */}
      {openApprovalModal && selectedRequest && (
        <ApprovalModal
          selectedRequest={selectedRequest}
          onClose={() => setOpenApprovalModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {openRejectModal && selectedRequest && (
        <RejectModal
          selectedRequest={selectedRequest}
          onClose={() => setOpenRejectModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {openRejectionConfirm && (
        <RejectionConfirmModal
          onClose={() => { setOpenRejectionConfirm(false); fetchCounts(); }}
          onSuccess={handleModalSuccess}
          openLightbox={openLightbox}
        />
      )}

      {openCompletionConfirm && (
        <CompletionConfirmModal
          onClose={() => { setOpenCompletionConfirm(false); fetchCounts(); }}
          onSuccess={handleModalSuccess}
          openLightbox={openLightbox}
        />
      )}

      {openUpdateModal && selectedRequest && currentUser && (
        <UpdateStatusModal
          selectedRequest={selectedRequest}
          currentUser={currentUser}
          onClose={() => setOpenUpdateModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {openPermissionModal && (
        <PermissionModal
          employees={employees}
          requests={requests}
          onClose={() => setOpenPermissionModal(false)}
        />
      )}

      {openAddModal && (
        <AddRequestModal
          onClose={() => setOpenAddModal(false)}
          setShowSuccessModal={setShowSuccessModal}
        />
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        isRTL={isRTL}
      />

    </div>
  );
}

export default Requests;