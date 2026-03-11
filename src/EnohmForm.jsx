import { Upload, X, CheckCircle } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import hero from "/hero.jpg";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Yup from "yup";
import { Formik } from "formik";
import AddRequestForm from "./AddRequestForm";

// ✅ Success Modal Component
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

function EnohmForm() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';


  const [showSuccessModal, setShowSuccessModal] = useState(false); 




  return (
    <div className="w-full min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* ✅ Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        isRTL={isRTL}
      />

      {/* HERO SECTION */}
      <div className="relative w-full h-[93vh]">
        <img src={hero} className="w-full h-full object-cover" alt="hero" />

        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-4 md:px-[90px]">
          <div className="max-w-2xl">
            <h1 className="text-white text-3xl md:text-5xl font-extrabold mb-4 leading-snug">
              {t('form.heroTitle')}
            </h1>
            <p className="text-gray-200 text-base md:text-lg leading-relaxed">
              {t('form.heroSubtitle')}
            </p>
            <button className="mt-6 px-8 py-3 bg-[#f2a057] text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition">
              <a href="#formSection">{t('form.heroButton')}</a>
            </button>
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <div className="w-full bg-gray-50/40 flex justify-center px-4 py-10" id="formSection">
        <div className="bg-white p-6 w-full md:w-[90%] shadow-md rounded-2xl">
          <div className="flex flex-col justify-start items-start">
            <h2 className="text-xl font-bold mb-2 text-blue-950">{t('form.title')}</h2>
            <hr className="w-[100px] h-[3px] bg-yellow-500 border-none mb-6" />
          </div>
<AddRequestForm setShowSuccessModal={setShowSuccessModal} />
</div>
</div>
      <Footer />
    </div>
  );
}

export default EnohmForm;