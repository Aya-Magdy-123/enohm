import { Upload, X } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";


function EnohmForm() {
  const list = ["Bau", "Innenausbau", "Sanierung", "Home-Ready-Service"];
  const levels = ["Standard", "Plus", "Premium"];

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
    name: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("data:", data);
    toast.success("Anfrage erfolgreich gesendet!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const removePhoto = (index) => {
    const newPhotos = data.photo.filter((_, idx) => idx !== index);
    setData({ ...data, photo: newPhotos });
  };

  return (
    <div className="w-full min-h-screen" dir="ltr">
      <Navbar />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />


      {/* HERO SECTION */}
      <div className="relative w-full h-[93vh]">
        <img
          src="https://enohm.net/wp-content/uploads/2024/06/Enohm-GmbH-1.jpg"
          className="w-full h-full object-cover"
          alt="hero"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-start text-start px-[90px]">
          <div className="max-w-2xl">
            <h1 className="text-white text-3xl md:text-5xl font-extrabold mb-4 leading-snug">
              Fordern Sie jetzt ein Angebot an
            </h1>

            <p className="text-gray-200 text-base md:text-lg leading-relaxed">
              Fordern Sie jetzt ein Angebot für Ihr Projekt an und erhalten Sie
              die besten Lösungen mit höchster Qualität und in kürzester Zeit.
            </p>

            <button className="mt-6 px-8 py-3 bg-[#f2a057] text-white font-bold rounded-lg shadow-md hover:bg-[#f2a057] transition">
              <a href="#formSection">Jetzt starten</a>
            </button>
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <div
        className="w-full bg-gray-50/40 flex justify-center px-4 py-10 "
        id="formSection"
      >
        <div className="bg-white p-6 w-full md:w-[90%] shadow-md rounded-2xl">
          <div className="flex flex-col justify-start items-start">
            <h2 className="text-xl font-bold mb-2 text-blue-950">
              Angebot anfordern
            </h2>

            <hr className="w-[100px] h-[3px] bg-yellow-500 border-none mb-6" />
          </div>

          <form className="flex flex-col gap-4 text-md">
            {/* نوع الخدمة */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="font-semibold mb-3 text-gray-800">
                Welche Dienstleistung?
              </p>

              <div className="flex flex-wrap w-full items-center gap-2 justify-center">
                {list.map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setSelectedService(item);
                      setData({ ...data, serviceType: item });
                    }}
                    className={`${
                      selectedService === item
                        ? "bg-[#f2a057] text-white border-[#f2a057]"
                        : "cursor-pointer bg-white text-[#f2a057] border border-orange-300 hover:bg-orange-50 hover:border-orange-400"
                    } px-4 py-1 rounded-full font-medium shadow-sm transition text-sm`}
                  >
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* مستوى الجودة */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="font-semibold mb-3 text-gray-800">
                Qualitätsstufe wählen
              </p>

              <div className="flex flex-wrap w-full items-center gap-2 justify-center">
                {levels.map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setSelectedLevel(item);
                      setData({ ...data, qualityLevel: item });
                    }}
                    className={`${
                      selectedLevel === item
                        ? "bg-[#f2a057] text-white border-[#f2a057]"
                        : "cursor-pointer bg-white text-[#f2a057] border border-orange-300 hover:bg-orange-50 hover:border-orange-400"
                    } px-4 py-1 rounded-full font-medium shadow-sm transition text-sm`}
                  >
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* موقع + مساحة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
              <div>
                <p className="text-gray-800 font-semibold mb-1 text-start">
                  Projektstandort
                </p>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) =>
                    setData({ ...data, location: e.target.value })
                  }
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                  placeholder="Geben Sie den Projektstandort ein"
                />
              </div>

              <div>
                <p className="text-gray-800 font-semibold mb-1 text-start">
                  Fläche
                </p>
                <input
                  type="text"
                  value={data.area}
                  onChange={(e) => setData({ ...data, area: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                  placeholder="Geben Sie die Fläche ein"
                />
              </div>
            </div>

            {/* ملاحظات */}
            <div>
              <p className="text-gray-800 font-semibold mb-1 text-start">
                Zusätzliche Hinweise
              </p>
              <textarea
                rows="3"
                value={data.notes}
                onChange={(e) => setData({ ...data, notes: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition resize-none text-xs"
                placeholder="Schreiben Sie hier Ihre Hinweise"
              ></textarea>
            </div>

            {/* رفع صور */}
            <div className="w-full flex flex-col">
              <p className="text-start text-gray-800 font-semibold mb-1">
                Bild hochladen
              </p>

              <label
                htmlFor="photo"
                className="w-full min-h-[15vh] cursor-pointer flex flex-col gap-1 items-center mt-2 border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-orange-400 transition"
              >
                <Upload className="w-7 h-7 text-gray-400" />
                <p className="text-xs">
                  {Array.isArray(data.photo) && data.photo.length > 0
                    ? `${data.photo.length} Bild(er)`
                    : "Bild hochladen"}
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
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition opacity-0 group-hover:opacity-100"
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
                  Vollständiger Name
                </p>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                  placeholder="Geben Sie Ihren vollständigen Namen ein"
                />
              </div>

              <div>
                <p className="text-gray-800 font-semibold mb-1 text-start">
                  Telefonnummer
                </p>
                <input
                  type="text"
                  value={data.phoneNumber}
                  onChange={(e) =>
                    setData({ ...data, phoneNumber: e.target.value })
                  }
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition text-xs"
                  placeholder="Geben Sie Ihre Telefonnummer ein"
                />
              </div>
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-10 py-2 self-center bg-[#f2a057] text-white rounded-lg font-bold text-sm shadow-md hover:bg-orange-600 transition"
            >
              Anfrage senden
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EnohmForm;