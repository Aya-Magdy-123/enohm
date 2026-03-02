import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useTranslation } from 'react-i18next';

function Cladding() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const features = [
    { icon: "🪟", title: t('cladding.f1Title'), desc: t('cladding.f1Desc') },
    { icon: "🧱", title: t('cladding.f2Title'), desc: t('cladding.f2Desc') },
    { icon: "🎨", title: t('cladding.f3Title'), desc: t('cladding.f3Desc') },
    { icon: "🛡️", title: t('cladding.f4Title'), desc: t('cladding.f4Desc') },
  ];

  const images = {
    main: "https://images.pexels.com/photos/32473242/pexels-photo-32473242.png",
    mainLarge: "https://images.pexels.com/photos/32473242/pexels-photo-32473242.png",
    thumbs: [
      { src: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop", large: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop" },
      { src: "https://images.pexels.com/photos/410696/pexels-photo-410696.jpeg", large: "https://images.pexels.com/photos/410696/pexels-photo-410696.jpeg" },
      { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop", large: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop" },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        .hero-bg { background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 50%, #ffffff 100%); position: relative; overflow: hidden; }
        .hero-bg::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(234,179,8,0.06) 0%, transparent 70%); pointer-events: none; }
        .accent-line { width: 80px; height: 4px; background: linear-gradient(90deg, #eab308, #f59e0b); border-radius: 2px; }
        .gold-text { background: linear-gradient(135deg, #ca8a04, #eab308, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .img-main { clip-path: polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%); }
        .feature-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s ease; }
        .feature-card:hover { background: #fffbeb; border-color: rgba(234,179,8,0.4); box-shadow: 0 8px 24px rgba(234,179,8,0.12); transform: translateY(-3px); }
        .img-thumb { overflow: hidden; border-radius: 12px; border: 2px solid rgba(0,0,0,0.08); transition: all 0.3s ease; }
        .img-thumb:hover { border-color: rgba(234,179,8,0.7); transform: scale(1.03); }
        .img-thumb img { transition: transform 0.4s ease; }
        .img-thumb:hover img { transform: scale(1.1); }
        .lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(6px); animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .lightbox-img { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 16px; box-shadow: 0 30px 80px rgba(0,0,0,0.5); animation: zoomIn 0.25s ease; }
        @keyframes zoomIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .lightbox-close { position: absolute; top: 20px; right: 24px; color: white; cursor: pointer; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; font-size: 1.2rem; }
        .lightbox-close:hover { background: rgba(255,255,255,0.3); }
        .zoomable { cursor: zoom-in; }
        .badge { background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.4); color: #ca8a04; font-size: 0.8rem; padding: 4px 14px; border-radius: 20px; display: inline-block; margin-bottom: 16px; }
        .cta-btn { background: linear-gradient(135deg, #eab308, #f59e0b); color: #fff; font-weight: 700; padding: 14px 36px; border-radius: 8px; border: none; cursor: pointer; font-size: 1rem; transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(234,179,8,0.3); display: inline-block; text-decoration: none; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(234,179,8,0.45); }
        .section-divider { border: none; border-top: 1px solid rgba(0,0,0,0.07); margin: 0; }
      `}</style>

      <Navbar />

      {/* Hero */}
      <section className="hero-bg relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            {/* Text */}
            <div className="flex-1 z-10">
              <span className="badge">{t('cladding.badge')}</span>
              <div className="accent-line mb-6" />
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                {t('cladding.title1')}{" "}
                <span className="gold-text">{t('cladding.titleHighlight')}</span>
                <br />
                {t('cladding.title2')}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg">
                {t('cladding.desc1')}
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-lg">
                {t('cladding.desc2')}
              </p>
              <Link to="/quote" className="cta-btn">{t('cladding.cta')}</Link>
            </div>

            {/* Images */}
            <div className="flex-1 z-10">
              <div className="img-main overflow-hidden rounded-2xl mb-3 border-2 border-yellow-500/20">
                <img
                  src={images.main}
                  alt="cladding"
                  className="w-full h-64 object-cover zoomable"
                  onClick={() => setLightboxSrc(images.mainLarge)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {images.thumbs.map((img, i) => (
                  <div key={i} className="img-thumb">
                    <img
                      src={img.src}
                      alt={`cladding-${i}`}
                      className="w-full h-28 object-cover zoomable"
                      onClick={() => setLightboxSrc(img.large)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Features */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="accent-line mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">{t('cladding.featuresTitle')}</h2>
            <p className="text-gray-500 mt-3">{t('cladding.featuresSub')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className="feature-card rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">{f.icon}</div>
                <div className="text-gray-800 font-bold mb-2 text-sm">{f.title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>✕</button>
          <img src={lightboxSrc} alt="zoom" className="lightbox-img" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Cladding;