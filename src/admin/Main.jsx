import React, { useState, useEffect } from 'react';
import { FileText, FileCheck, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function Main() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          date: d.data().createdAt?.toDate() || null
        }));
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // إحصائيات ديناميكية
  const totalCount = requests.length;
  const completedCount = requests.filter(r => r.status === 'مكتمل').length;
  const pendingCount = requests.filter(r => r.status !== 'مكتمل').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const stats = [
    { title: 'إجمالي الطلبات', value: totalCount, icon: FileText, textColor: 'text-blue-500', bgLight: 'bg-blue-50' },
    { title: 'الطلبات المكتملة', value: completedCount, icon: FileCheck, textColor: 'text-green-500', bgLight: 'bg-green-50' },
    { title: 'قيد المراجعة', value: pendingCount, icon: Clock, textColor: 'text-orange-500', bgLight: 'bg-orange-50' },
    { title: 'معدل الإنجاز', value: `${completionRate}%`, icon: TrendingUp, textColor: 'text-purple-500', bgLight: 'bg-purple-50' }
  ];

  // بيانات الرسم البياني — شهرية ديناميكية
  const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  const monthlyData = monthNames.map((month, i) => {
    const completed = requests.filter(r =>
      r.status === 'مكتمل' && r.date && r.date.getMonth() === i
    ).length;
    const pending = requests.filter(r =>
      r.status !== 'مكتمل' && r.date && r.date.getMonth() === i
    ).length;
    return { month, completed, pending };
  });

  // آخر 5 طلبات
  const recentRequests = requests.slice(0, 5);

  const serviceColors = {
    'بناء':         'bg-blue-100 text-blue-700',
    'إكساء':        'bg-purple-100 text-purple-700',
    'ترميم':        'bg-amber-100 text-amber-700',
    'تجهيز للعودة': 'bg-teal-100 text-teal-700',
  };

  const getServiceColor = (type) => {
    for (const key of Object.keys(serviceColors)) {
      if (type?.includes(key)) return serviceColors[key];
    }
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6" dir="rtl">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`${stat.bgLight} p-3 rounded-xl`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">{stat.title}</p>
                {loading
                  ? <div className="w-12 h-7 bg-gray-200 rounded animate-pulse mt-1" />
                  : <p className="text-2xl font-bold text-blue-950">{stat.value}</p>
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-950 mb-1">الطلبات خلال العام</h3>
          <p className="text-gray-400 text-sm">إحصائيات شهرية للطلبات في {new Date().getFullYear()}</p>
        </div>

        {loading ? (
          <div className="w-full h-64 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#999', fontSize: 11 }} reversed={true} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', direction: 'rtl', fontSize: 13 }}
                labelStyle={{ color: '#1e3a5f', fontWeight: 'bold' }}
                cursor={{ fill: '#f9fafb' }}
              />
              <Legend wrapperStyle={{ direction: 'rtl', paddingTop: '16px', fontSize: 13 }} iconType="circle" />
              <Bar dataKey="completed" fill="#22c55e" radius={[6, 6, 0, 0]} name="مكتملة" maxBarSize={40} />
              <Bar dataKey="pending" fill="#f2a057" radius={[6, 6, 0, 0]} name="قيد المراجعة" maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-blue-950 mb-4">آخر الطلبات</h3>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">لا توجد طلبات بعد</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">{request.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-950 text-sm">{request.name}</p>
                    <p className="text-xs text-gray-400">{request.date?.toLocaleDateString('ar-EG') || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getServiceColor(request.serviceType)}`}>
                    {request.serviceType}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${request.status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                    {request.status === 'مكتمل' ? 'مكتمل' : 'قيد المراجعة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;