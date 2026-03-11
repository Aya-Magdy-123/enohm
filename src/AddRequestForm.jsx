import { useTranslation } from "react-i18next";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Yup from "yup";
import { ErrorMessage, Formik } from "formik";
import { useState } from "react";
import { Upload, X } from "lucide-react";


function AddRequestForm({setShowSuccessModal}){
     const { t, i18n } = useTranslation();
      const isRTL = i18n.language === 'ar';
    
      const list = [
        { key: "construction", label: t('services.construction'), value: "construction" },
        { key: "finishing", label: t('services.finishing'), value: "finishing" },
        { key: "renovation", label: t('services.renovation'), value: "renovation" },
        { key: "homeReady", label: t('services.homeReady'), value: "homeReady" }
      ];
    
      const levels = [
        { key: "standard", label: t('quality.standard'), value: "standard" },
        { key: "plus", label: t('quality.plus'), value: "plus" },
        { key: "premium", label: t('quality.premium'), value: "premium" }
      ];
    
      const validationForm = Yup.object().shape({
        serviceType: Yup.string().required(t("required")),
        qualityLevel: Yup.string().required(t("required")),
        location: Yup.string().required(t("required")),
        area: Yup.string().required(t("required")),
        notes: Yup.string(),
        photo: Yup.array(),
        phoneNumber: Yup.number().typeError("يجب أن يكون أرقام").required(t("required")),
        name: Yup.string().required(t("required")),
      });
    
       const [selectedService, setSelectedService] = useState("");
        const [selectedLevel, setSelectedLevel] = useState("");
        const [loading, setLoading] = useState(false);

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
        status: "pending",
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
    return(
 

          <Formik
            initialValues={{
              serviceType: "",
              qualityLevel: "",
              location: "",
              area: "",
              notes:"",
              photo: [],
              phoneNumber: "",
              name: "",
            }}
            validationSchema={validationForm}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-md">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                  <p className="font-semibold text-gray-800">{t('form.serviceType')}</p>

           <ErrorMessage name="serviceType" component="p" className="text-sm text-red-600 inline-block" />
</div>
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
                        <p>{item.label}</p>
                      </div>
                    ))}
                  </div>
                  
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                  <p className="font-semibold text-gray-800">{t('form.qualityLevel')}؟</p>
           <ErrorMessage name="qualityLevel" component="p" className="text-sm text-red-600 inline-block" />
           </div>

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
                        <p>{item.label}</p>
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
           <ErrorMessage name="location" component="p" className="text-sm text-red-600 inline-block" />

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
           <ErrorMessage name="area" component="p" className="text-sm text-red-600 inline-block" />

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
           <ErrorMessage name="notes" component="p" className="text-sm text-red-600 inline-block" />

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
                      setFieldValue("photo", [...values.photo, ...filesArray]);
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
           <ErrorMessage name="name" component="p" className="text-sm text-red-600 inline-block" />

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
           <ErrorMessage name="phoneNumber" component="p" className="text-sm text-red-600 inline-block" />

                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading }
                  className={`px-10 py-2 self-center ${loading ? "bg-gray-400" : "bg-[#f2a057] hover:bg-orange-600"} text-white rounded-lg font-bold text-sm shadow-md transition`}
                >
                  {t('form.submit')}
                </button>
              </form>
            )}
          </Formik>
     
    );
}
export default AddRequestForm;