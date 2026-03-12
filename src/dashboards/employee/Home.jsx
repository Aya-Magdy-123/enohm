import React, { useState, useEffect, useMemo } from 'react';
import { FileText, FileCheck, Clock, Loader2 } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';

const CustomTooltip = ({ active, payload, label }) => {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3 text-right min-w-[130px]" dir="rtl">
      <p className="text-xs font-bold text-blue-950 mb-1.5 border-b border-gray-100 pb-1">{label}</p>
      <p className="text-sm font-bold text-green-600">{payload[0].value} {t('home.chart.requestCompleted')}</p>
    </div>
  );
};

function Home() {
  const { t,i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedYear = selectedDate.getFullYear();

  const MONTH_NAMES = [
    t('main.months.january'),  t('main.months.february'), t('main.months.march'),
    t('main.months.april'),    t('main.months.may'),      t('main.months.june'),
    t('main.months.july'),     t('main.months.august'),   t('main.months.september'),
    t('main.months.october'),  t('main.months.november'), t('main.months.december'),
  ];

  /* ── auth ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u || null));
    return unsub;
  }, []);

  /* ── fetch ── */
  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'requests'))
        );
       const filterd= snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt?.toDate() || null })).filter(req => !req.exceptEmployees?.includes(currentUser.uid))

        setRequests(filterd);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [currentUser]);

  /* ── counts ── */
  const totalCount     = requests.length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const notDoneCount   = requests.filter(r => r.status !== 'completed').length;

  const stats = [
    { title: t('home.stats.totalRequests'), value: totalCount,     icon: FileText,  textColor: 'text-blue-500',   bgLight: 'bg-blue-50',   border: 'border-blue-100' },
    { title: t('home.stats.completed'),     value: completedCount, icon: FileCheck, textColor: 'text-green-500',  bgLight: 'bg-green-50',  border: 'border-green-100' },
    { title: t('home.stats.incomplete'),    value: notDoneCount,   icon: Clock,     textColor: 'text-orange-500', bgLight: 'bg-orange-50', border: 'border-orange-100' },
  ];

  /* ── chart data ── */
  const chartData = useMemo(() => MONTH_NAMES.map((month, i) => ({
    month,
    value: requests.filter(r =>
      r.status === 'completed' &&
      r.date &&
      r.date.getFullYear() === selectedYear &&
      r.date.getMonth() === i
    ).length,
  })), [requests, selectedYear, t]);

  const yearTotal = chartData.reduce((s, m) => s + m.value, 0);

  return (
    <div className="space-y-6" dir={i18n.language==="ar"? "rtl":"ltr"}>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-9 h-9 text-[#f2a057] animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* ── Stats ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const pct  = totalCount > 0 ? Math.round((stat.value / totalCount) * 100) : 0;
              return (
                <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${stat.border} flex flex-col gap-3 hover:shadow-md transition-shadow duration-300`}>
                  <div className="flex items-center justify-between">
                    <div className={`${stat.bgLight} p-2.5 rounded-xl`}>
                      <Icon className={`w-5 h-5 ${stat.textColor}`} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{pct}%</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-950">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{stat.title}</p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: stat.textColor.includes('blue') ? '#3b82f6' : stat.textColor.includes('green') ? '#22c55e' : '#f97316' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Bar Chart ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* header */}
            <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
              <div>
                <h2 className="text-base font-bold text-blue-950">{t('home.chart.title')}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('home.chart.subtitle')} — {selectedYear}
                  {yearTotal > 0 && (
                    <span className="mr-2 text-green-600 font-bold">
                      ({yearTotal} {t('home.chart.completedCount')})
                    </span>
                  )}
                </p>
              </div>

              {/* year picker */}
              <div className="year-picker-wrapper">
                <style>{`
                  .year-picker-wrapper .react-datepicker-wrapper { display: block; }
                  .year-picker-wrapper .react-datepicker__input-container input {
                    width: 120px; padding: 8px 16px;
                    border: 1.5px solid #e5e7eb; border-radius: 12px;
                    font-size: 14px; font-weight: 700; color: #1e3a5f;
                    background: #f9fafb; cursor: pointer; text-align: center;
                    outline: none; transition: all 0.2s; direction: rtl;
                  }
                  .react-datepicker__navigation { top: 20px }
                  .year-picker-wrapper .react-datepicker__input-container input:hover { border-color: #f2a057; background: #fff; }
                  .year-picker-wrapper .react-datepicker__input-container input:focus { border-color: #f2a057; box-shadow: 0 0 0 3px rgba(242,160,87,0.15); background: #fff; }
                  .year-picker-wrapper .react-datepicker { border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.12); font-family: inherit; overflow: hidden; }
                  .year-picker-wrapper .react-datepicker__header { background: #1e3a5f; border: none; padding: 14px 0 10px; }
                  .year-picker-wrapper .react-datepicker-year-header { color: #fff; font-weight: 700; font-size: 14px; }
                  .year-picker-wrapper .react-datepicker__navigation-icon::before { border-color: #fff; }
                  .year-picker-wrapper .react-datepicker__navigation:hover *::before { border-color: #f2a057; }
                  .year-picker-wrapper .react-datepicker__year-wrapper { max-width: 220px; padding: 8px; gap: 4px; }
                  .year-picker-wrapper .react-datepicker__year-text { width: 90px !important; padding: 8px 0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #374151; transition: all 0.15s; }
                  .year-picker-wrapper .react-datepicker__year-text:hover { background: #fff4eb; color: #f2a057; }
                  .year-picker-wrapper .react-datepicker__year-text--selected,
                  .year-picker-wrapper .react-datepicker__year-text--keyboard-selected { background: #f2a057 !important; color: #fff !important; border-radius: 10px; }
                `}</style>
                <DatePicker
                  selected={selectedDate}
                  onChange={(d) => setSelectedDate(d)}
                  showYearPicker
                  dateFormat="yyyy"
                  placeholderText={t('home.chart.yearPlaceholder')}
                />
              </div>
            </div>

            {/* chart */}
            <div className="px-4 py-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} barSize={36} margin={{ top: 4, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    reversed={true}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} name={t('home.stats.completed')}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.value > 0 ? '#22c55e' : '#e5e7eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* summary */}
            <div className="mx-6 mb-6">
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-green-600 font-semibold">
                  {t('home.chart.summary')} {selectedYear}
                </span>
                <span className="text-lg font-extrabold text-green-700">{yearTotal}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;