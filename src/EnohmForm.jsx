import { Upload, X } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import hero from "/hero.jpg";

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

  const [selectedService, setSelectedService] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  const [data, setData] = useState({
    serviceType: "",
    qualityLevel: "",
    location: "",
    area: "",
    notes: "",
    photo: [],
    phoneNumber: "",
    name: "",
   
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("data:", data);
    localStorage.setItem("enohmFormData", JSON.stringify(data));
    toast.success(t('form.success'), {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const removePhoto = (index) => {
    const newPhotos = data.photo.filter((_, idx) => idx !== index);
    setData({ ...data, photo: newPhotos });
  };

  return (
    <div className="w-full min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={isRTL}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* HERO SECTION */}
      <div className="relative w-full h-[93vh]">
        <img
          src={hero}
          className="w-full h-full object-cover"
          alt="hero"
        />

        {/* Overlay */}
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
      <div
        className="w-full bg-gray-50/40 flex justify-center px-4 py-10"
        id="formSection"
      >
        <div className="bg-white p-6 w-full md:w-[90%] shadow-md rounded-2xl">
          <div className="flex flex-col justify-start items-start">
            <h2 className="text-xl font-bold mb-2 text-blue-950">
              {t('form.title')}
            </h2>

            <hr className="w-[100px] h-[3px] bg-yellow-500 border-none mb-6" />
          </div>

          <form className="flex flex-col gap-4 text-md">
            {/* نوع الخدمة */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="font-semibold mb-3 text-gray-800">
                {t('form.serviceType')}
              </p>

              <div className="flex flex-wrap w-full items-center gap-2 justify-center">
                {list.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      setSelectedService(item.key);
                      setData({ ...data, serviceType: item.value });
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

            {/* مستوى الجودة */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="font-semibold mb-3 text-gray-800">
                {t('form.qualityLevel')}
              </p>

              <div className="flex flex-wrap w-full items-center gap-2 justify-center">
                {levels.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      setSelectedLevel(item.key);
                      setData({ ...data, qualityLevel: item.value });
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

            {/* موقع + مساحة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
              <div>
                <p className="text-gray-800 font-semibold mb-1 text-start">
                  {t('form.location')}
                </p>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) =>
                    setData({ ...data, location: e.target.value })
                  }
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                  placeholder={t('form.locationPlaceholder')}
                />
              </div>

              <div>
                <p className="text-gray-800 font-semibold mb-1 text-start">
                  {t('form.area')}
                </p>
                <input
                  type="text"
                  value={data.area}
                  onChange={(e) => setData({ ...data, area: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                  placeholder={t('form.areaPlaceholder')}
                />
              </div>
            </div>

            {/* ملاحظات */}
            <div>
              <p className="text-gray-800 font-semibold mb-1 text-start">
                {t('form.notes')}
              </p>
              <textarea
                rows="3"
                value={data.notes}
                onChange={(e) => setData({ ...data, notes: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition resize-none text-xs"
                placeholder={t('form.notesPlaceholder')}
              ></textarea>
            </div>

            {/* رفع صور */}
            <div className="w-full flex flex-col">
              <p className="text-start text-gray-800 font-semibold mb-1">
                {t('form.uploadPhotos')}
              </p>

              <label
                htmlFor="photo"
                className="w-full min-h-[15vh] cursor-pointer flex flex-col gap-1 items-center mt-2 border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-orange-400 transition"
              >
                <Upload className="w-7 h-7 text-gray-400" />
                <p className="text-xs">
                  {Array.isArray(data.photo) && data.photo.length > 0
                    ? `${data.photo.length} ${t('form.photosCount')}`
                    : t('form.uploadPhotosPlaceholder')}
                </p>

                {Array.isArray(data.photo) && data.photo.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.photo.map((file, idx) => (
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
                            removePhoto(idx);
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
                id="photo"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const filesArray = Array.from(e.target.files);
                  setData({ ...data, photo: filesArray });
                }}
              />
            </div>

            {/* الاسم + رقم الهاتف */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
              <div>
                <p className="text-gray-800 font-semibold mb-1 text-start">
                  {t('form.fullName')}
                </p>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                  placeholder={t('form.fullNamePlaceholder')}
                />
              </div>

              <div>
                <p className="text-gray-800 font-semibold mb-1 text-start">
                  {t('form.phone')}
                </p>
                <input
                  type="text"
                  value={data.phoneNumber}
                  onChange={(e) =>
                    setData({ ...data, phoneNumber: e.target.value })
                  }
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                  placeholder={t('form.phonePlaceholder')}
                />
              </div>
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-10 py-2 self-center bg-[#f2a057] text-white rounded-lg font-bold text-sm shadow-md hover:bg-orange-600 transition"
            >
              {t('form.submit')}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EnohmForm;