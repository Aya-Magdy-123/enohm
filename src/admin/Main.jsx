import React from 'react';
import { FileText, FileCheck, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Main() {
  // بيانات الإحصائيات
  const stats = [
    {
      title: 'إجمالي الطلبات',
      value: '1',
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      bgLight: 'bg-blue-50'
    },
    {
      title: 'الطلبات المكتملة',
      value: '0',
      icon: FileCheck,
      color: 'bg-green-500',
      textColor: 'text-green-500',
      bgLight: 'bg-green-50'
    },
    {
      title: 'قيد المراجعة',
      value: '1',
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      bgLight: 'bg-orange-50'
    },
    {
      title: 'معدل الإنجاز',
      value: '0%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      bgLight: 'bg-purple-50'
    }
  ];

  // بيانات الرسم البياني - عدد الطلبات المكتملة لكل شهر
  const monthlyData = [
    { month: 'يناير', completed: 0 },
    { month: 'فبراير', completed: 0 },
    { month: 'مارس', completed: 0 },
    { month: 'أبريل', completed: 2 },
    { month: 'مايو', completed: 0 },
    { month: 'يونيو', completed: 1 },
    { month: 'يوليو', completed: 0 },
    { month: 'أغسطس', completed: 0 },
    { month: 'سبتمبر', completed: 0 },
    { month: 'أكتوبر', completed: 0 },
    { month: 'نوفمبر', completed: 0 },
    { month: 'ديسمبر', completed: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      {/* <div>
        <h2 className="text-3xl font-bold text-blue-950 mb-2">الصفحة الرئيسية</h2>
        <p className="text-gray-600">نظرة عامة على إحصائيات الطلبات</p>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgLight} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className={`${stat.color} w-2 h-2 rounded-full animate-pulse`}></div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold text-blue-950">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-blue-950 mb-2">الطلبات المكتملة خلال العام</h3>
          <p className="text-gray-600 text-sm">إحصائيات شهرية للطلبات المكتملة في 2026</p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#666', fontSize: 12 }}
              reversed={true}
            />
            <YAxis tick={{ fill: '#666', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                direction: 'rtl'
              }}
              labelStyle={{ color: '#333', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ direction: 'rtl', paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="completed" 
              fill="#22c55e" 
              radius={[8, 8, 0, 0]}
              name="الطلبات المكتملة"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-blue-950 mb-4">آخر الطلبات</h3>
        <div className="space-y-3">
          {[
            { id: '#1234', service: 'بناء', status: 'مكتمل', date: '2024-12-15' },
            { id: '#1235', service: 'إكساء', status: 'قيد المراجعة', date: '2024-12-14' },
            { id: '#1236', service: 'ترميم', status: 'مكتمل', date: '2024-12-13' },
            { id: '#1237', service: 'تجهيز المنزل', status: 'قيد المراجعة', date: '2024-12-12' }
          ].map((request, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-950">{request.id}</p>
                  <p className="text-sm text-gray-600">{request.service}</p>
                </div>
              </div>
              <div className="text-end">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  request.status === 'مكتمل' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {request.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">{request.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

export default Main;