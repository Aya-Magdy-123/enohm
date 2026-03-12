import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import logo from "/logo.webp"
import { useTranslation } from 'react-i18next';

function Login() {
  const{t,i18n}=useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  let user;
  let role;

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    const tokenResult = await user.getIdTokenResult(true);
    const role = tokenResult.claims.role || '';

    console.log('User Role:', role); 

    if (role === 'admin') {
      
      // toast.success('تم تسجيل الدخول بنجاح!');
      navigate('/dashboard');
    } else if (role === 'employee') {
      toast.success(t("loginSuccess"));
      navigate('/dashboard/home');
    } else {
      toast.error(t("noPermission"));
      await auth.signOut(); // اطرده لو مالوش role
    }
  } catch (err) {
    if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      toast.error(t("invalidCredentials"));
    } else {
      toast.error(t("errorTryAgain"));
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={i18n.language==="ar"?"rtl":"ltr"}>
      <ToastContainer position="top-center" rtl={true} />
      
      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 p-8 text-center">
          <img 
            src={logo} 
            className="w-48 h-auto mx-auto mb-4 filter brightness-0 invert"
            alt="Enohm Logo"
          />
          <p className="text-gray-300 text-sm"> {t("loginToDashboard")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 text-start">
             {t("email")}
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
             {t("password")}
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
               {t("loggingIn")}
              </span>
            ) : (
              t("login")
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