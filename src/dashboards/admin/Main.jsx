import React, { useState, useEffect, useMemo } from 'react';
import { FileText, FileCheck, Clock, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3  min-w-[140px]" >
      <p className="text-xs font-bold text-blue-950 mb-2 border-b border-gray-100 pb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <span className="text-xs text-gray-500">{p.name}</span>
          <span className="text-sm font-bold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function Main() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedYear = selectedDate.getFullYear();

  const MONTH_NAMES = [
    t('main.months.january'),  t('main.months.february'), t('main.months.march'),
    t('main.months.april'),    t('main.months.may'),      t('main.months.june'),
    t('main.months.july'),     t('main.months.august'),   t('main.months.september'),
    t('main.months.october'),  t('main.months.november'), t('main.months.december'),
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'requests'), orderBy('createdAt', 'desc')));
        setRequests(snap.docs.map(d => ({
          id: d.id, ...d.data(),
          date: d.data().createdAt?.toDate() || null
        })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  /* ── Stats ── */
  const totalCount     = requests.length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const notDoneCount   = requests.filter(r => r.status !== 'completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const stats = [
    { title: t('main.stats.totalRequests'),     value: totalCount,           icon: FileText,  textColor: 'text-blue-500',   bgLight: 'bg-blue-50',   border: 'border-blue-100',   ring: 'ring-blue-100' },
    { title: t('main.stats.completedRequests'), value: completedCount,       icon: FileCheck, textColor: 'text-green-500',  bgLight: 'bg-green-50',  border: 'border-green-100',  ring: 'ring-green-100' },
    { title: t('main.stats.incompleteRequests'),value: notDoneCount,         icon: Clock,     textColor: 'text-orange-500', bgLight: 'bg-orange-50', border: 'border-orange-100', ring: 'ring-orange-100' },
    { title: t('main.stats.completionRate'),    value: `${completionRate}%`, icon: TrendingUp,textColor: 'text-purple-500', bgLight: 'bg-purple-50', border: 'border-purple-100', ring: 'ring-purple-100' },
  ];

  /* ── Chart Data ── */
  const chartData = useMemo(() => MONTH_NAMES.map((month, i) => {
    const monthReqs = requests.filter(r =>
      r.date && r.date.getFullYear() === selectedYear && r.date.getMonth() === i
    );
    return {
      month,
      completed: monthReqs.filter(r => r.status === 'completed').length,
      notDone:   monthReqs.filter(r => r.status !== 'completed').length,
    };
  }), [requests, selectedYear, t]);

  const totalForYear = chartData.reduce((s, m) => s + m.completed + m.notDone, 0);

  return (
    <div className="space-y-6" dir={i18n.language==="ar"? "rtl": "ltr"} >

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${stat.border} flex items-center justify-between gap-4 hover:shadow-md transition-shadow duration-300`}>
              
              <div className="min-w-0">
                <p className="text-gray-400 text-xs mb-0.5 truncate">{stat.title}</p>
                {loading
                  ? <div className="w-14 h-7 bg-gray-100 rounded-lg animate-pulse mt-1" />
                  : <p className="text-2xl font-extrabold text-blue-950 leading-tight">{stat.value}</p>
                }
              </div>
              <div className={`${stat.bgLight} p-3.5 rounded-2xl ring-4 ${stat.ring} flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bar Chart ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Chart Header */}
        <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
          <div>
            <h3 className="text-lg font-bold text-blue-950">{t('main.chart.title')}</h3>
            <p className="text-gray-400 text-xs mt-0.5">
              {t('main.chart.subtitle')} — {selectedYear}
              {!loading && (
                <span className="mr-2 text-blue-950 font-semibold">
                  ({totalForYear} {t('main.chart.requestCount')})
                </span>
              )}
            </p>
          </div>

          {/* ── Year Picker ── */}
          <div className="year-picker-wrapper">
            <style>{`
              .year-picker-wrapper .react-datepicker-wrapper { display: block; }
              .year-picker-wrapper .react-datepicker__input-container input {
                width: 130px;
                padding: 8px 16px;
                border: 1.5px solid #e5e7eb;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 700;
                color: #1e3a5f;
                background: #f9fafb;
                cursor: pointer;
                text-align: center;
                outline: none;
                transition: all 0.2s;
                
              }
              .year-picker-wrapper .react-datepicker__input-container input:hover {
                border-color: #f2a057;
                background: #fff;
              }
              .react-datepicker__navigation { top: 20px }
              .year-picker-wrapper .react-datepicker__input-container input:focus {
                border-color: #f2a057;
                box-shadow: 0 0 0 3px rgba(242,160,87,0.15);
                background: #fff;
              }
              .year-picker-wrapper .react-datepicker {
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.12);
                font-family: inherit;
                overflow: hidden;
              }
              .year-picker-wrapper .react-datepicker__header {
                background: #1e3a5f;
                border: none;
                padding: 14px 0 10px;
              }
              .year-picker-wrapper .react-datepicker__current-month,
              .year-picker-wrapper .react-datepicker-year-header {
                color: #fff;
                font-weight: 700;
                font-size: 14px;
              }
              .year-picker-wrapper .react-datepicker__navigation-icon::before { border-color: #fff; }
              .year-picker-wrapper .react-datepicker__navigation:hover *::before { border-color: #f2a057; }
              .year-picker-wrapper .react-datepicker__year-wrapper {
                max-width: 220px;
                padding: 8px;
                gap: 4px;
              }
              .year-picker-wrapper .react-datepicker__year-text {
                width: 90px !important;
                padding: 8px 0;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                transition: all 0.15s;
              }
              .year-picker-wrapper .react-datepicker__year-text:hover {
                background: #fff4eb;
                color: #f2a057;
              }
              .year-picker-wrapper .react-datepicker__year-text--selected,
              .year-picker-wrapper .react-datepicker__year-text--keyboard-selected {
                background: #f2a057 !important;
                color: #fff !important;
                border-radius: 10px;
              }
            `}</style>

            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showYearPicker
              dateFormat="yyyy"
              placeholderText={t('main.chart.yearPlaceholder')}
            />
          </div>
        </div>

        {/* Chart Body */}
        <div className="px-4 py-6">
          {loading ? (
            <div className="w-full h-64 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barGap={6} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                  reversed={true}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{  paddingTop: '20px', fontSize: 13, fontWeight: 600 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="completed" fill="#22c55e" radius={[6, 6, 0, 0]} name={t('main.chart.legend.completed')} maxBarSize={36} />
                <Bar dataKey="notDone"   fill="#f2a057" radius={[6, 6, 0, 0]} name={t('main.chart.legend.notDone')}    maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend summary */}
        {!loading && (
          <div className="mx-6 mb-6 grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-green-600 font-semibold">
                {t('main.chart.summary.completedInYear')} {selectedYear}
              </span>
              <span className="text-lg font-extrabold text-green-700">
                {chartData.reduce((s, m) => s + m.completed, 0)}
              </span>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-orange-500 font-semibold">
                {t('main.chart.summary.incompleteInYear')} {selectedYear}
              </span>
              <span className="text-lg font-extrabold text-orange-600">
                {chartData.reduce((s, m) => s + m.notDone, 0)}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default Main;