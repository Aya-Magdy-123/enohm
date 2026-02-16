import React, { useState } from 'react';
import { FileText, FileCheck, Clock, Search, Filter, MapPin, Home, Phone, User, Calendar } from 'lucide-react';
import hero from "/hero.jpg";
function Requests() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    }
  ];

  // بيانات الطلبات
  const allRequests = [
    {
      id: '#1234',
      name: 'أحمد محمد',
      phone: '+49 176 12345678',
      service: 'بناء',
      quality: 'ممتازة',
      location: 'برلين، ألمانيا',
      area: '250 م²',
      date: '2024-12-15',
      status: 'مكتمل',
      notes: 'مشروع بناء فيلا سكنية'
    },
    {
      id: '#1235',
      name: 'فاطمة علي',
      phone: '+49 176 23456789',
      service: 'إكساء',
      quality: 'جيدة',
      location: 'ميونخ، ألمانيا',
      area: '180 م²',
      date: '2024-12-14',
      status: 'قيد المراجعة',
      notes: 'تشطيب داخلي لشقة'
    },
    {
      id: '#1236',
      name: 'محمود حسن',
      phone: '+49 176 34567890',
      service: 'ترميم',
      quality: 'عادية',
      location: 'فرانكفورت، ألمانيا',
      area: '320 م²',
      date: '2024-12-13',
      status: 'مكتمل',
      notes: 'ترميم مبنى قديم'
    },
    {
      id: '#1237',
      name: 'سارة خالد',
      phone: '+49 176 45678901',
      service: 'تجهيز المنزل للعودة',
      quality: 'ممتازة',
      location: 'هامبورغ، ألمانيا',
      area: '200 م²',
      date: '2024-12-12',
      status: 'قيد المراجعة',
      notes: 'تجهيز منزل كامل'
    },
    {
      id: '#1238',
      name: 'عمر يوسف',
      phone: '+49 176 56789012',
      service: 'بناء',
      quality: 'جيدة',
      location: 'كولونيا، ألمانيا',
      area: '400 م²',
      date: '2024-12-11',
      status: 'مكتمل',
      notes: 'بناء عمارة سكنية'
    },
    {
      id: '#1239',
      name: 'ليلى أحمد',
      phone: '+49 176 67890123',
      service: 'إكساء',
      quality: 'ممتازة',
      location: 'دورتموند، ألمانيا',
      area: '150 م²',
      date: '2024-12-10',
      status: 'قيد المراجعة',
      notes: 'تشطيب مكتب إداري'
    }
  ];

  const requestData = JSON.parse(localStorage.getItem("enohmFormData"));

  // فلترة الطلبات
//   const filteredRequests = allRequests.filter(request => {
//     const matchesTab = 
//       activeTab === 'all' ? true :
//       activeTab === 'completed' ? request.status === 'مكتمل' :
//       activeTab === 'pending' ? request.status === 'قيد المراجعة' : true;

//     const matchesSearch = 
//       request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       request.service.toLowerCase().includes(searchQuery.toLowerCase());

//     return matchesTab && matchesSearch;
//   });

  const tabs = [
    { key: 'all', label: 'الكل', count: 1 },
    { key: 'completed', label: 'المكتملة', count: 0 },
    { key: 'pending', label: 'قيد المراجعة', count: 1}
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      {/* <div>
        <h2 className="text-3xl font-bold text-blue-950 mb-2">الطلبات</h2>
        <p className="text-gray-600">إدارة ومتابعة جميع طلبات العملاء</p>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن طلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f2a057] focus:border-[#f2a057] outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            <Filter className="w-5 h-5" />
            <span className="font-semibold">تصفية</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-lg">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-[#f2a057] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
          <div 
            
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                {/* <div>
                  <p className="font-bold text-blue-950 text-lg">{request.id}</p>
                  <p className="text-sm text-gray-500">{request.date}</p>
                </div> */}
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                
                 
                   'bg-orange-100 text-orange-700'
              }`}>
                قيد المراجعه
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{requestData.name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 direction-ltr">{requestData.phoneNumber}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{requestData.serviceType} - {requestData.qualityLevel}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{requestData.location}</span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">المساحة: {requestData.area}</span>
              </div>

              {requestData.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{requestData.notes}</p>
                </div>
              )}

              
                    
                      
                        <img
                          src={hero}
                          className="w-[100px] h-[100px] rounded-lg object-cover"
                          alt={`preview`}
                        />
                  
                  
                

            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t flex justify-center gap-2">
             
              <button className=" px-4 w-[200px] py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-semibold">
                إكمال
              </button>
            </div>
          </div>
       
      </div>

      {/* Empty State */}
      {/* {filteredRequests.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-500">لم يتم العثور على أي طلبات تطابق البحث</p>
        </div>
      )} */}
    </div>
  );
}

export default Requests;