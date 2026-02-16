import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // محاكاة عملية تسجيل الدخول
    setTimeout(() => {
      if (formData.email === 'admin@enohm.com' && formData.password === 'admin123') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', formData.email);
        toast.success('تم تسجيل الدخول بنجاح!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <ToastContainer position="top-center" rtl={true} />
      
      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 p-8 text-center">
          <img 
            src="https://enohm.net/wp-content/uploads/2024/06/cropped-gif.webp" 
            className="w-48 h-auto mx-auto mb-4 filter brightness-0 invert"
            alt="Enohm Logo"
          />
          {/* <h2 className="text-2xl font-bold text-white mb-2">لوحة التحكم</h2> */}
          <p className="text-gray-300 text-sm">قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 text-start">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f2a057] focus:border-[#f2a057] outline-none transition"
                placeholder="admin@enohm.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 text-start">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f2a057] focus:border-[#f2a057] outline-none transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          {/* <div className="flex items-center justify-between mb-6">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="ml-2 w-4 h-4 text-[#f2a057] focus:ring-[#f2a057] rounded" />
              <span className="text-gray-600 text-sm">تذكرني</span>
            </label>
            <a href="#" className="text-[#f2a057] text-sm hover:underline">نسيت كلمة المرور؟</a>
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#f2a057] text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري تسجيل الدخول...
              </span>
            ) : (
              'تسجيل الدخول'
            )}
          </button>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 text-center mb-2 font-semibold">بيانات تجريبية:</p>
            <p className="text-xs text-gray-600 text-center">البريد: admin@enohm.com</p>
            <p className="text-xs text-gray-600 text-center">كلمة المرور: admin123</p>
          </div> */}
        </form>
      </div>
    </div>
  );
}

export default Login;