import React, { useState, useEffect } from 'react';
import { FileText, FileCheck, Clock, Search, Filter, MapPin, Home, Phone, Loader2, X, Download, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

function Requests() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');
  const [lightbox, setLightbox] = useState({ open: false, photos: [], index: 0 });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        date: d.data().createdAt || '-'
      }));
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleComplete = async (requestId) => {
    try {
      await updateDoc(doc(db, "requests", requestId), { status: "مكتمل" });
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "مكتمل" } : r));
    } catch (err) { console.error(err); }
  };

  const openLightbox = (photos, index) => setLightbox({ open: true, photos, index });
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

  const serviceColors = {
    'بناء':           { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
    'إكساء':          { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    'ترميم':          { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
    'تجهيز للعودة':   { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500' },
  };

  const qualityStars = { 'عادية': 1, 'جيدة': 2, 'ممتازة': 3 };

  const getServiceColor = (type) => {
    for (const key of Object.keys(serviceColors)) {
      if (type?.includes(key)) return serviceColors[key];
    }
    return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' };
  };

  const totalCount = requests.length;
  const completedCount = requests.filter(r => r.status === 'مكتمل').length;
  const pendingCount = requests.filter(r => r.status !== 'مكتمل').length;

  const stats = [
    { title: t('requests.totalRequests'), value: totalCount, icon: FileText, textColor: 'text-blue-500', bgLight: 'bg-blue-50' },
    { title: t('requests.completedRequests'), value: completedCount, icon: FileCheck, textColor: 'text-green-500', bgLight: 'bg-green-50' },
    { title: t('requests.underReview'), value: pendingCount, icon: Clock, textColor: 'text-orange-500', bgLight: 'bg-orange-50' }
  ];

  const tabs = [
    { key: 'all', label: t('requests.all'), count: totalCount },
    { key: 'completed', label: t('requests.completed'), count: completedCount },
    { key: 'pending', label: t('requests.pending'), count: pendingCount }
  ];

  const serviceOptions = [
    { key: '', label: t('requests.all') },
    { key: 'بناء', label: t('services.construction') },
    { key: 'إكساء', label: t('services.finishing') },
    { key: 'ترميم', label: t('services.renovation') },
    { key: 'تجهيز للعودة', label: t('services.homeReady') },
  ];

  const qualityOptions = [
    { key: '', label: t('requests.all') },
    { key: 'عادية', label: t('quality.standard') },
    { key: 'جيدة', label: t('quality.plus') },
    { key: 'ممتازة', label: t('quality.premium') },
  ];

  const filteredRequests = requests.filter(r => {
    const matchesTab = activeTab === 'all' ? true : activeTab === 'completed' ? r.status === 'مكتمل' : r.status !== 'مكتمل';
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) || r.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = serviceFilter ? r.serviceType?.includes(serviceFilter) : true;
    const matchesQuality = qualityFilter ? r.qualityLevel?.includes(qualityFilter) : true;
    return matchesTab && matchesSearch && matchesService && matchesQuality;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f2a057]/30 focus:border-[#f2a057] outline-none`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${showFilters || serviceFilter || qualityFilter ? 'bg-[#f2a057] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Filter className="w-4 h-4" />
            {t('requests.filters')}
          </button>
          <button onClick={fetchRequests} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-600 transition">
            {t('requests.refresh')}
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
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === tab.key ? 'bg-[#f2a057] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
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

      {/* Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRequests.map((request) => {
            const svcColor = getServiceColor(request.serviceType);
            const stars = qualityStars[request.qualityLevel] || 0;
            const isCompleted = request.status === 'مكتمل';

            return (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">

                {/* Top Strip */}
                <div className={`${svcColor.bg} ${svcColor.border} border-b px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${svcColor.dot}`}></div>
                    <span className={`font-bold text-sm ${svcColor.text}`}>{request.serviceType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                      {isCompleted ? t('requests.statusCompleted') : t('requests.statusPending')}
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
                        <p className="text-xs text-gray-400 mt-0.5">{request.date?.toDate().toLocaleDateString(
                          i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'de' ? 'de-DE' : 'en-US'
                        )}</p>
                      </div>
                    </div>
                    <a href={`tel:${request.phoneNumber}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 font-medium transition">
                      <Phone className="w-3.5 h-3.5" />
                      {request.phoneNumber}
                    </a>
                  </div>

                  <div className="border-t border-dashed border-gray-100" />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t('requests.location')}</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{request.location || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Home className="w-3 h-3" /> {t('requests.area')}</p>
                      <p className="text-sm font-semibold text-gray-700">{request.area || '—'}</p>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-xs text-amber-600 font-semibold mb-1">{t('requests.notes')}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{request.notes}</p>
                    </div>
                  )}

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
                <div className="px-5 pb-4">
                  {!isCompleted ? (
                    <button onClick={() => handleComplete(request.id)}
                      className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-green-200">
                      {t('requests.completeRequest')}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-bold text-center border border-green-100">
                      {t('requests.alreadyCompleted')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
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
          <button onClick={(e) => { e.stopPropagation(); handleDownload(lightbox.photos[lightbox.index]); }} className="absolute top-4 left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"><Download className="w-5 h-5" /></button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xs bg-white/10 px-3 py-1 rounded-full">{lightbox.index + 1} / {lightbox.photos.length}</div>
          {lightbox.photos.length > 1 && <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }} className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"><ChevronLeft className="w-5 h-5" /></button>}
          <img src={lightbox.photos[lightbox.index]} className="max-w-[88vw] max-h-[82vh] rounded-2xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} alt="zoom" />
          {lightbox.photos.length > 1 && <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }} className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"><ChevronRight className="w-5 h-5" /></button>}
          {lightbox.photos.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {lightbox.photos.map((url, idx) => (
                <img key={idx} src={url} onClick={(e) => { e.stopPropagation(); setLightbox(p => ({ ...p, index: idx })); }}
                  className={`w-12 h-12 rounded-lg object-cover cursor-pointer transition ${idx === lightbox.index ? 'ring-2 ring-[#f2a057] opacity-100' : 'opacity-40 hover:opacity-70'}`} alt="" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Requests;