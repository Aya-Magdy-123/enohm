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

  const list = [
    { key: "construction", value: t('services.construction') },
    { key: "finishing", value: t('services.finishing') },
    { key: "renovation", value: t('services.renovation') },
    { key: "homeReady", value: t('services.homeReady') }
  ];

  const levels = [
    { key: "standard", value: t('quality.standard') },
    { key: "plus", value: t('quality.plus') },
    { key: "premium", value: t('quality.premium') }
  ];

  const validationForm = Yup.object().shape({
    serviceType: Yup.string().required("required"),
    qualityLevel: Yup.string().required("required"),
    location: Yup.string().required("required"),
    area: Yup.string().required("required"),
    notes: Yup.string(),
    photo: Yup.array(),
    phoneNumber: Yup.string().required("required"),
    name: Yup.string().required("required"),
  });

  const [selectedService, setSelectedService] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ modal state

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (values, { resetForm }) => {
    try {
      let photoUrls = [];
      setLoading(true);

      if (values.photo && values.photo.length > 0) {
        const formData = new FormData();
        values.photo.forEach((file) => formData.append("photos", file));

        const res = await fetch(`${baseUrl}/upload`, {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        photoUrls = result.urls;
      }

      await addDoc(collection(db, "requests"), {
        serviceType: values.serviceType,
        qualityLevel: values.qualityLevel,
        location: values.location,
        area: values.area,
        notes: values.notes,
        name: values.name,
        phoneNumber: values.phoneNumber,
        photos: photoUrls,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        type: "newRequest",
        submittedAt: serverTimestamp(),
        serviceType: values.serviceType,
        isRead: false
      });

      resetForm();
      setSelectedService("");
      setSelectedLevel("");
      setLoading(false);
      setShowSuccessModal(true); // ✅ show modal instead of toast

    } catch (err) {
      console.error(err);
      setLoading(false);
      alert(isRTL ? 'حصل خطأ، جرب مره اخري' : 'Something went wrong, please try again.');
    }
  };

  const removePhoto = (index, values, setFieldValue) => {
    const newPhotos = values.photo.filter((_, idx) => idx !== index);
    setFieldValue("photo", newPhotos);
  };

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

          <Formik
            initialValues={{
              serviceType: "",
              qualityLevel: "",
              location: "",
              area: "",
              notes: Yup.string(),
              photo: Yup.array(),
              phoneNumber: "",
              name: "",
            }}
            validationSchema={validationForm}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-md">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="font-semibold mb-3 text-gray-800">{t('form.serviceType')}</p>
                  <div className="flex flex-wrap w-full items-center gap-2 justify-center">
                    {list.map((item) => (
                      <div
                        name="serviceType"
                        key={item.key}
                        onClick={() => {
                          setSelectedService(item.key);
                          setFieldValue("serviceType", item.value);
                        }}
                        className={`${
                          selectedService === item.key
                            ? "bg-[#f2a057] text-white border-[#f2a057]"
                            : "cursor-pointer bg-white text-[#f2a057] border border-orange-300 hover:bg-orange-50 hover:border-orange-400"
                        } px-4 py-2 rounded-full font-medium shadow-sm transition text-sm`}
                      >
                        <p>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="font-semibold mb-3 text-gray-800">{t('form.qualityLevel')}</p>
                  <div className="flex flex-wrap w-full items-center gap-2 justify-center">
                    {levels.map((item) => (
                      <div
                        name="qualityLevel"
                        key={item.key}
                        onClick={() => {
                          setSelectedLevel(item.key);
                          setFieldValue("qualityLevel", item.value);
                        }}
                        className={`${
                          selectedLevel === item.key
                            ? "bg-[#f2a057] text-white border-[#f2a057]"
                            : "cursor-pointer bg-white text-[#f2a057] border border-orange-300 hover:bg-orange-50 hover:border-orange-400"
                        } px-4 py-2 rounded-full font-medium shadow-sm transition text-sm`}
                      >
                        <p>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                  <div>
                    <p className="text-gray-800 font-semibold mb-1 text-start">{t('form.location')}</p>
                    <input
                      name="location"
                      type="text"
                      value={values.location}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                      placeholder={t('form.locationPlaceholder')}
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold mb-1 text-start">{t('form.area')}</p>
                    <input
                      name="area"
                      type="text"
                      value={values.area}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                      placeholder={t('form.areaPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-gray-800 font-semibold mb-1 text-start">{t('form.notes')}</p>
                  <textarea
                    name="notes"
                    rows="3"
                    value={values.notes}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition resize-none text-xs"
                    placeholder={t('form.notesPlaceholder')}
                  ></textarea>
                </div>

                <div className="w-full flex flex-col">
                  <p className="text-start text-gray-800 font-semibold mb-1">{t('form.uploadPhotos')}</p>
                  <label
                    htmlFor="photo"
                    className="w-full min-h-[15vh] cursor-pointer flex flex-col gap-1 items-center mt-2 border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-orange-400 transition"
                  >
                    <Upload className="w-7 h-7 text-gray-400" />
                    <p className="text-xs">
                      {Array.isArray(values.photo) && values.photo.length > 0
                        ? `${values.photo.length} ${t('form.photosCount')}`
                        : t('form.uploadPhotosPlaceholder')}
                    </p>
                    {Array.isArray(values.photo) && values.photo.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {values.photo.map((file, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              className="w-[100px] h-[100px] rounded-lg object-cover"
                              alt={`preview ${idx}`}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removePhoto(idx, values, setFieldValue);
                              }}
                              className={`absolute ${isRTL ? '-left-2' : '-right-2'} -top-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition opacity-0 group-hover:opacity-100`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">png, jpg, webp, jpeg</p>
                  </label>
                  <input
                    name="photo"
                    id="photo"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const filesArray = Array.from(e.target.files);
                      setFieldValue("photo", filesArray);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                  <div>
                    <p className="text-gray-800 font-semibold mb-1 text-start">{t('form.fullName')}</p>
                    <input
                      name="name"
                      type="text"
                      value={values.name}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                      placeholder={t('form.fullNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold mb-1 text-start">{t('form.phone')}</p>
                    <input
                      name="phoneNumber"
                      type="text"
                      value={values.phoneNumber}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                      placeholder={t('form.phonePlaceholder')}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-10 py-2 self-center ${loading ? "bg-gray-400" : "bg-[#f2a057] hover:bg-orange-600"} text-white rounded-lg font-bold text-sm shadow-md transition`}
                >
                  {t('form.submit')}
                </button>
              </form>
            )}
          </Formik>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EnohmForm;