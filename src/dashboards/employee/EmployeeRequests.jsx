import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Filter,
  MapPin,
  Home,
  Phone,
  Loader2,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ClipboardEdit,
  MessageSquare,
  CheckCircle2,
  XCircle,
  User,
  Mail,
} from "lucide-react";
import { db, auth } from "../../firebase";
import {
  collection,
  doc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
  addDoc,
  where,
  getCountFromServer,
  getDocs,
  startAfter,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Modal from "../../components/Modal";
import { useTranslation } from "react-i18next";

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const PAGE_SIZE = 9;

/* ══════════════════════════════════════════════
   حالات الطلب
══════════════════════════════════════════════ */
const getStatusOptions = (t) => [
  {
    label: t("employeeRequests.status.contacted"),
    value: "contacted",
    notesKey: "notesForContacted",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    label: t("employeeRequests.status.inProgress"),
    value: "inProgress",
    notesKey: "notesForInProgress",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    label: t("employeeRequests.status.completed"),
    value: "completed",
    notesKey: "notesForCompleted",
    badge: "bg-green-100 text-green-700",
  },
];

/* ألوان الخدمات */
const serviceColors = {
  construction: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  finishing: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  renovation: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  " homeReady": {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
};
const getServiceColor = (type) => {
  for (const key of Object.keys(serviceColors))
    if (type?.includes(key)) return serviceColors[key];
  return {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-400",
  };
};

/* ══════════════════════════════════════════════
   ملاحظات الموظف
══════════════════════════════════════════════ */
const EmployeeNotes = ({ request }) => {
  const { t } = useTranslation();
  const STATUS_OPTIONS = getStatusOptions(t);

  const entries = STATUS_OPTIONS.map((opt) => {
    const note = request[opt.notesKey];
    return note
      ? {
          label: opt.label,
          badge: opt.badge,
          note,
          employeeName: request[`${opt.notesKey}ByName`],
        }
      : null;
  }).filter(Boolean);

  if (!entries.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
        <MessageSquare className="w-3 h-3" />{" "}
        {t("employeeRequests.card.myNotes")}
      </p>
      {entries.map(({ label, badge, note, employeeName }) => (
        <div
          key={label}
          className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex gap-3 items-start"
        >
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap mt-0.5 flex-shrink-0 ${badge}`}
          >
            {label}
          </span>
          <div className="flex-1">
            <p className="text-sm text-gray-600 leading-relaxed">{note}</p>
            {employeeName && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <User className="w-3 h-3" /> {employeeName}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
function EmployeeRequests() {
  const { t, i18n } = useTranslation();

  const STATUS_OPTIONS = getStatusOptions(t);
  const getStatusOpt = (val) => STATUS_OPTIONS.find((s) => s.value === val);
  const getStatusBadge = (s) => {
    if (s === "pending") return "bg-gray-100 text-gray-600";
    if (s === "approved") return "bg-teal-100 text-teal-700";
    if (s === "rejected") return "bg-red-100 text-red-600";
    return getStatusOpt(s)?.badge || "bg-gray-100 text-gray-500";
  };
  const getStatusLabel = (s) => {
    if (s === "pending") return t("status.pending");
    if (s === "approved") return t("employeeRequests.status.approved");
    if (s === "rejected") return t("status.rejected");
    return getStatusOpt(s)?.label || s || "—";
  };

  /* ── auth ── */
  const [currentUser, setCurrentUser] = useState(null);
  const [employeeName, setEmployeeName] = useState("");

  /* ── data ── */
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── pagination ── */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [cursors, setCursors] = useState({}); // { pageNum: lastDocSnapshot }

  /* ── tab counts ── */
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    contacted: 0,
    inProgress: 0,
    completed: 0,
  });

  /* ── filters / search ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* ── lightbox ── */
  const [lightbox, setLightbox] = useState({
    open: false,
    photos: [],
    index: 0,
  });

  /* ── update modal ── */
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── approve modal ── */
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState(null);

  /* ── reject modal ── */
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState(null);

  /* ══════════════════════════════════════════════
     AUTH
  ══════════════════════════════════════════════ */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setEmployeeName(user.displayName || user.email || "");
      }
    });
    return unsub;
  }, []);

  /* ══════════════════════════════════════════════
     FETCH HELPERS
  ══════════════════════════════════════════════ */

  /**
   * بناء الـ where constraints
   * — دايماً نفلتر بـ permissionedEmployees array-contains
   * — + التاب + serviceFilter + statusFilter
   */
  const buildConstraints = useCallback((uid, tab, svcFilter, stFilter) => {
    const c = [where("permissionedEmployees", "array-contains", uid)];
    if (tab !== "all") c.push(where("status", "==", tab));
    if (svcFilter) c.push(where("serviceType", "==", svcFilter));
    if (stFilter) c.push(where("status", "==", stFilter));
    return c;
  }, []);

  /** جيب عدد كل الـ tabs */
  const fetchCounts = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const base = where("permissionedEmployees", "array-contains", uid);
      const statuses = [
        "pending",
        "approved",
        "contacted",
        "inProgress",
        "completed",
      ];

      const [allSnap, ...statusSnaps] = await Promise.all([
        getCountFromServer(query(collection(db, "requests"), base)),
        ...statuses.map((s) =>
          getCountFromServer(
            query(collection(db, "requests"), base, where("status", "==", s)),
          ),
        ),
      ]);

      const counts = { all: allSnap.data().count };
      statuses.forEach((s, i) => {
        counts[s] = statusSnaps[i].data().count;
      });
      setTabCounts(counts);
    } catch (err) {
      console.error(err);
    }
  }, []);

  /** جيب صفحة */
  const fetchPage = useCallback(
    async (uid, page, tab, svcFilter, stFilter, cursorsMap) => {
      if (!uid) return;
      setLoading(true);
      try {
        const constraints = buildConstraints(uid, tab, svcFilter, stFilter);

        /* عدد هذه الـ query تحديداً */
        const countSnap = await getCountFromServer(
          query(collection(db, "requests"), ...constraints),
        );
        setTotalCount(countSnap.data().count);

        /* بناء الـ query */
        const baseQ = query(
          collection(db, "requests"),
          ...constraints,
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE),
        );

        let pageQuery = baseQ;
        if (page > 1 && cursorsMap[page - 1]) {
          pageQuery = query(
            collection(db, "requests"),
            ...constraints,
            orderBy("createdAt", "desc"),
            startAfter(cursorsMap[page - 1]),
            limit(PAGE_SIZE),
          );
        }

        const snap = await getDocs(pageQuery);
        setRequests(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            date: d.data().createdAt || null,
          })),
        );

        /* حفظ الـ cursor */
        if (snap.docs.length > 0) {
          const lastDoc = snap.docs[snap.docs.length - 1];
          setCursors((prev) => ({ ...prev, [page]: lastDoc }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [buildConstraints],
  );

  /* ── initial load بعد ما يجي الـ currentUser ── */
  useEffect(() => {
    if (!currentUser) return;
    fetchCounts(currentUser.uid);
    fetchPage(currentUser.uid, 1, activeTab, serviceFilter, statusFilter, {});
    setCursors({});
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  /* ── reset عند تغيير التاب / الفلتر ── */
  useEffect(() => {
    if (!currentUser) return;
    setCursors({});
    setCurrentPage(1);
    fetchPage(currentUser.uid, 1, activeTab, serviceFilter, statusFilter, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, serviceFilter, statusFilter]);

  /* ── refresh يدوي ── */
  const fetchData = () => {
    if (!currentUser) return;
    setCursors({});
    setCurrentPage(1);
    fetchCounts(currentUser.uid);
    fetchPage(currentUser.uid, 1, activeTab, serviceFilter, statusFilter, {});
  };

  /* ══════════════════════════════════════════════
     PAGINATION NAVIGATION
  ══════════════════════════════════════════════ */
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const goToPage = (page) => {
    if (!currentUser || page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchPage(
      currentUser.uid,
      page,
      activeTab,
      serviceFilter,
      statusFilter,
      cursors,
    );
  };

  const getPaginationPages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  /* ══════════════════════════════════════════════
     MODAL HANDLERS
  ══════════════════════════════════════════════ */
  const openUpdate = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status || "");
    setNotes("");
    setOpenUpdateModal(true);
  };

  const handleUpdate = async () => {
    if (!newStatus || !selectedRequest) return;
    setSubmitting(true);
    try {
      const opt = getStatusOpt(newStatus);
      const notesKey = opt?.notesKey;
      let updateData;

      if (newStatus === "completed") {
        updateData = {
          status: "pendingForCompleted",
          approvedForCompleting: false,
          updatedAt: new Date(),
          lastUpdatedById: currentUser.uid,
          lastUpdatedByName: employeeName,
          ...(notesKey && notes.trim()
            ? {
                [notesKey]: notes.trim(),
                [`${notesKey}ByName`]: employeeName,
              }
            : {}),
        };
      } else {
        updateData = {
          status: newStatus,
          updatedAt: new Date(),
          lastUpdatedById: currentUser.uid,
          lastUpdatedByName: employeeName,
          ...(notesKey && notes.trim()
            ? {
                [notesKey]: notes.trim(),
                [`${notesKey}ByName`]: employeeName,
              }
            : {}),
        };
      }

      await updateDoc(doc(db, "requests", selectedRequest.id), updateData);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, ...updateData } : r,
        ),
      );
      setOpenUpdateModal(false);
      setNewStatus("");
      setNotes("");
      await addDoc(collection(db, "notifications"), {
        type: "updatedRequest",
        submittedAt: serverTimestamp(),
        employeeId: currentUser.uid,
        employeeName: employeeName,
        status: newStatus,
        client: selectedRequest.name,
        read: false,
      });
      fetchCounts(currentUser.uid);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!approvingRequest) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "requests", approvingRequest.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
      });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === approvingRequest.id ? { ...r, status: "approved" } : r,
        ),
      );
      setOpenApprovalModal(false);
      setApprovingRequest(null);
      fetchCounts(currentUser.uid);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingRequest) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "requests", rejectingRequest.id), {
        approvedByAdmin: false,
        rejectedByEmployeeAt: serverTimestamp(),
        rejectedByEmployeeId: currentUser.uid,
        rejectedByEmployeeName: employeeName,
        status: "pendingForReject",
      });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === rejectingRequest.id
            ? { ...r, approvedByAdmin: false, status: "pendingForReject" }
            : r,
        ),
      );
      await addDoc(collection(db, "notifications"), {
        type: "rejectionRequest",
        submittedAt: serverTimestamp(),
        employeeId: currentUser.uid,
        employeeName: employeeName,
        client: rejectingRequest.name,
        read: false,
      });
      setOpenRejectModal(false);
      setRejectingRequest(null);
      fetchCounts(currentUser.uid);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ══════════════════════════════════════════════
     LIGHTBOX
  ══════════════════════════════════════════════ */
  const openLightbox = (photos, index) =>
    setLightbox({ open: true, photos, index });
  const closeLightbox = () =>
    setLightbox({ open: false, photos: [], index: 0 });
  const prevPhoto = () =>
    setLightbox((p) => ({
      ...p,
      index: (p.index - 1 + p.photos.length) % p.photos.length,
    }));
  const nextPhoto = () =>
    setLightbox((p) => ({ ...p, index: (p.index + 1) % p.photos.length }));
  const handleDownload = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `photo-${Date.now()}.jpg`;
    link.click();
  };

  /* ══════════════════════════════════════════════
     CLIENT-SIDE SEARCH (على الـ 9 docs الحالية)
  ══════════════════════════════════════════════ */
  const filteredRequests = searchQuery.trim()
    ? requests.filter(
        (r) =>
          r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : requests;

  /* ══════════════════════════════════════════════
     UI CONFIG
  ══════════════════════════════════════════════ */
  const selectedStatusOpt = getStatusOpt(newStatus);

  const stats = [
    {
      title: t("employeeRequests.stats.total"),
      value: tabCounts.all,
      textColor: "text-blue-500",
      bgLight: "bg-blue-50",
    },
    {
      title: t("status.pending"),
      value: tabCounts.pending,
      textColor: "text-gray-500",
      bgLight: "bg-gray-50",
    },
    {
      title: t("employeeRequests.stats.inProgress"),
      value: tabCounts.inProgress,
      textColor: "text-amber-500",
      bgLight: "bg-amber-50",
    },
    {
      title: t("employeeRequests.stats.completed"),
      value: tabCounts.completed,
      textColor: "text-green-500",
      bgLight: "bg-green-50",
    },
  ];

  const tabs = [
    { key: "all", label: t("employeeRequests.tabs.all"), count: tabCounts.all },
    { key: "pending", label: t("status.pending"), count: tabCounts.pending },
    {
      key: "contacted",
      label: t("employeeRequests.tabs.contacted"),
      count: tabCounts.contacted,
    },
    { key: "approved", label: t("status.approved"), count: tabCounts.approved },
    {
      key: "inProgress",
      label: t("employeeRequests.tabs.inProgress"),
      count: tabCounts.inProgress,
    },
    {
      key: "completed",
      label: t("employeeRequests.tabs.completed"),
      count: tabCounts.completed,
    },
  ];

  const serviceOptions = [
    { key: "", label: t("employeeRequests.all") },
    { key: "construction", label: t("employeeRequests.services.building") },
    { key: "finishing", label: t("employeeRequests.services.cladding") },
    { key: "renovation", label: t("employeeRequests.services.renovation") },
    { key: " homeReady", label: t("employeeRequests.services.returnPrep") },
  ];

  const serviceTypesLangs = {
    construction: t("services.construction"),
    renovation: t("services.renovation"),
    finishing: t("services.finishing"),
    homeReady: t("services.homeReady"),
  };

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
          >
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

      {/* ── Search & Filter ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t("employeeRequests.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
            />
          </div>
          <div className="flex items-center *:flex-1 gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${showFilters || serviceFilter || statusFilter ? "bg-[#f2a057] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Filter className="w-4 h-4" /> {t("employeeRequests.filters")}
            </button>
            <button
              onClick={fetchData}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-600 transition"
            >
              <RefreshCw className="w-4 h-4" /> {t("employeeRequests.refresh")}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {t("employeeRequests.serviceType")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {serviceOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setServiceFilter(opt.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${serviceFilter === opt.key ? "bg-[#f2a057] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {t("employeeRequests.requestStatus")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setStatusFilter("")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${statusFilter === "" ? "bg-blue-950 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {t("employeeRequests.all")}
                </button>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${statusFilter === opt.value ? "bg-blue-950 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
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
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 flex-1 rounded-xl text-sm font-semibold transition whitespace-nowrap ${activeTab === tab.key ? "bg-[#f2a057] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
            >
              {tab.label}
              <span
                className={`mx-1.5 px-1.5 py-0.5 rounded-md text-xs ${activeTab === tab.key ? "bg-white/20" : "bg-gray-100"}`}
              >
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRequests.map((request) => {
            const svcColor = getServiceColor(request.serviceType);
            const isPending = request.status === "pending";

            return (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                {/* Top Strip */}
                <div
                  className={`${svcColor.bg} ${svcColor.border} border-b px-5 py-3 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${svcColor.dot}`} />
                    <span className={`font-bold text-sm ${svcColor.text}`}>
                      {serviceTypesLangs[request.serviceType]}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(request.status)}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-sm">
                          {request.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-blue-950 text-sm">
                          {request.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {request.date?.toDate?.().toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                    <a
                      href={`tel:${request.phoneNumber}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium transition"
                    >
                      <Phone className="w-3.5 h-3.5" /> {request.phoneNumber}
                    </a>

                    <a
                      href={`mailto:${request.email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium transition"
                    >
                      <Mail className="w-3.5 h-3.5" /> {request?.email || "-"}{" "}
                      
                    </a>
                  </div>
                  </div>

                  <div className="border-t border-dashed border-gray-100" />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{" "}
                        {t("employeeRequests.card.location")}
                      </p>
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {request.location || "—"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Home className="w-3 h-3" />{" "}
                        {t("employeeRequests.card.area")}
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {request.area || "—"}
                      </p>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-xs text-amber-600 font-semibold mb-1">
                        {t("employeeRequests.card.clientNotes")}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {request.notes}
                      </p>
                    </div>
                  )}

                  <EmployeeNotes request={request} />

                  {request.lastUpdatedByName && !isPending && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {t("lastUpdateBy")}:{" "}
                      <span className="font-semibold text-gray-600">
                        {request.lastUpdatedByName}
                      </span>
                    </p>
                  )}

                  {request.photos?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-2">
                        {t("employeeRequests.card.photos")} (
                        {request.photos.length})
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {request.photos.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => openLightbox(request.photos, idx)}
                            className="relative group cursor-zoom-in w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-200"
                          >
                            <img
                              src={url}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                              alt=""
                            />
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
                <div className="px-5 pb-4 flex justify-end gap-2">
                  {isPending && (
                    <>
                      <button
                        onClick={() => {
                          setApprovingRequest(request);
                          setOpenApprovalModal(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setRejectingRequest(request);
                          setOpenRejectModal(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-sm font-bold transition"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {!isPending &&
                    request.status !== "completed" &&
                    request.status !== "pendingForCompleted" &&
                    request.status !== "rejected" && (
                      <button
                        onClick={() => openUpdate(request)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition shadow-sm"
                      >
                        <ClipboardEdit className="w-4 h-4" />{" "}
                        {t("employeeRequests.card.updateStatus")}
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
          <h3 className="text-lg font-bold text-gray-700 mb-1">
            {t("employeeRequests.empty.title")}
          </h3>
          <p className="text-sm text-gray-400">
            {activeTab === "all"
              ? t("employeeRequests.empty.allDesc")
              : `${t("employeeRequests.empty.tabDesc")} "${tabs.find((tb) => tb.key === activeTab)?.label}"`}
          </p>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-gray-500">
            {t("pagination.showing") || "عرض"}{" "}
            <span className="font-bold text-blue-950">
              {(currentPage - 1) * PAGE_SIZE + 1}
            </span>
            {" — "}
            <span className="font-bold text-blue-950">
              {Math.min(currentPage * PAGE_SIZE, totalCount)}
            </span>{" "}
            {t("pagination.of") || "من"}{" "}
            <span className="font-bold text-blue-950">{totalCount}</span>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {i18n.language === "ar" ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {getPaginationPages().map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                    p === currentPage
                      ? "bg-[#f2a057] text-white shadow-sm"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {i18n.language === "ar" ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox.open && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(lightbox.photos[lightbox.index]);
            }}
            className="absolute top-4 left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
          >
            <Download className="w-5 h-5" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xs bg-white/10 px-3 py-1 rounded-full">
            {lightbox.index + 1} / {lightbox.photos.length}
          </div>
          {lightbox.photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <img
            src={lightbox.photos[lightbox.index]}
            className="max-w-[88vw] max-h-[82vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            alt="zoom"
          />
          {lightbox.photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {lightbox.photos.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {lightbox.photos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((p) => ({ ...p, index: idx }));
                  }}
                  className={`w-12 h-12 rounded-lg object-cover cursor-pointer transition ${idx === lightbox.index ? "ring-2 ring-[#f2a057] opacity-100" : "opacity-40 hover:opacity-70"}`}
                  alt=""
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ UPDATE MODAL ══════ */}
      {openUpdateModal && selectedRequest && (
        <Modal onClose={() => setOpenUpdateModal(false)}>
          <div
            className="flex flex-col gap-3"
            dir={i18n.language === "ar" ? "rtl" : "ltr"}
          >
            <h1
              className={`font-bold text-xl px-2 text-blue-950 ${i18n.language === "ar" ? "border-r-4 border-r-orange-500" : "border-l-4 border-l-orange-500"} py-1`}
            >
              {t("employeeRequests.modal.title")}
            </h1>
            <hr className="text-gray-200 rounded-full w-full" />

            <div className="bg-blue-50 border border-dashed border-blue-200 rounded-xl px-4 py-3 justify-between flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t("employeeRequests.modal.client")}
                </p>
                <p className="text-sm font-bold text-blue-950">
                  {selectedRequest.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t("employeeRequests.modal.serviceType")}
                </p>
                <p className="text-sm font-bold text-blue-950">
                  {selectedRequest.serviceType}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t("employeeRequests.modal.location")}
                </p>
                <p className="text-sm font-bold text-blue-950">
                  {selectedRequest.location || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  {t("employeeRequests.modal.currentStatus")}
                </p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${getStatusBadge(selectedRequest.status)}`}
                >
                  {getStatusLabel(selectedRequest.status)}
                </span>
              </div>
            </div>

            <EmployeeNotes request={selectedRequest} />

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                {t("employeeRequests.modal.newStatus")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setNewStatus(opt.value);
                      setNotes("");
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                      newStatus === opt.value
                        ? "bg-blue-950 text-white border-blue-950"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {newStatus && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  {t("employeeRequests.modal.notes")} —{" "}
                  {selectedStatusOpt?.label}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={`${t("employeeRequests.modal.notesPlaceholder")} "${selectedStatusOpt?.label}"...`}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => setOpenUpdateModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                {t("employeeRequests.modal.cancel")}
              </button>
              <button
                onClick={handleUpdate}
                disabled={!newStatus || submitting}
                className="px-8 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("employeeRequests.modal.save")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════ APPROVAL MODAL ══════ */}
      {openApprovalModal && approvingRequest && (
        <Modal onClose={() => setOpenApprovalModal(false)}>
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-orange-600 py-1">
              {t("approveRequest")}
            </h1>
            <hr className="text-gray-200 rounded-full w-full" />
            <div className="bg-blue-50 py-3 px-4 border-dashed border-blue-300 border rounded-lg">
              <span className="text-xs bg-orange-300 font-semibold rounded-full px-4">
                {approvingRequest.serviceType}
              </span>
              <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs">
                    <User className="w-3.5 h-3.5 inline-block ml-1" />
                    {t("clientName")}
                  </h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">
                    {approvingRequest.name}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs">
                    <Phone className="w-3.5 h-3.5 inline-block ml-1" />
                    {t("phoneNumber")}
                  </h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">
                    {approvingRequest.phoneNumber}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs">
                    <MapPin className="w-3.5 h-3.5 inline-block ml-1" />
                    {t("location")}
                  </h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">
                    {approvingRequest.location || "—"}
                  </p>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-gray-500 text-xs">
                    <Home className="w-3.5 h-3.5 inline-block ml-1" />
                    {t("area")}
                  </h3>
                  <p className="font-semibold text-sm text-blue-950 mt-0.5">
                    {approvingRequest.area} م<sup>2</sup>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3 justify-end">
              <button
                onClick={() => setOpenApprovalModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-10 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("acceptRequest")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════ REJECT MODAL ══════ */}
      {openRejectModal && rejectingRequest && (
        <Modal onClose={() => setOpenRejectModal(false)}>
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-xl px-2 text-blue-950 border-r-4 border-r-red-500 py-1">
              {t("rejectRequest")}
            </h1>
            <hr className="text-gray-200 rounded-full w-full" />
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-lg">
                  {rejectingRequest.name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  {rejectingRequest.name}
                </p>
                <p className="text-sm text-gray-500">
                  {rejectingRequest.serviceType} —{" "}
                  {rejectingRequest.phoneNumber}
                </p>
              </div>
            </div>

            {rejectingRequest.approvedByAdmin === true ? (
              <p className="text-sm text-gray-600 text-center">
                {t("lastUpdateAdminApproved")}{" "}
                <span className="font-bold text-red-600">{t("end")}</span>.
              </p>
            ) : (
              <p className="text-sm text-gray-600 text-center">
                {t("lastUpdatePendingAdmin")}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setOpenRejectModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="px-8 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-red-200 flex items-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {rejectingRequest.approvedByAdmin === true
                  ? t("finalRejectConfirm")
                  : t("sendRejectRequest")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default EmployeeRequests;
