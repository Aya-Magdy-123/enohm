import { Home, Wrench, Shield, Clock, Award, Users, CheckCircle, Building2, Paintbrush, HardHat, Home as HomeService, Star, Crown, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import hero from "/hero.jpg";
import { Link } from "react-router-dom";
import { useState, useEffect,useRef} from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function HomePage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const[pricing, setPricing] = useState(null);

  const features = [
    { icon: <Shield className="w-12 h-12" />, title: t('features.highQuality'), description: t('features.highQualityDesc') },
    { icon: <Clock className="w-12 h-12" />, title: t('features.onTimeDelivery'), description: t('features.onTimeDeliveryDesc') },
    { icon: <Award className="w-12 h-12" />, title: t('features.longExperience'), description: t('features.longExperienceDesc') },
    { icon: <Users className="w-12 h-12" />, title: t('features.professionalTeam'), description: t('features.professionalTeamDesc') },
    { icon: <Wrench className="w-12 h-12" />, title: t('features.comprehensiveServices'), description: t('features.comprehensiveServicesDesc') },
    { icon: <Home className="w-12 h-12" />, title: t('features.customSolutions'), description: t('features.customSolutionsDesc') }
  ];

  const services = [
    { title: t('services.construction'), description: t('services.constructionDesc'), icon: <Building2 className="w-16 h-16" />, image: "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg", to: "/construction" },
    { title: t('services.finishing'), description: t('services.finishingDesc'), icon: <Paintbrush className="w-16 h-16" />, image: "https://images.pexels.com/photos/32473242/pexels-photo-32473242.png", to: "/cladding" },
    { title: t('services.renovation'), description: t('services.renovationDesc'), icon: <HardHat className="w-16 h-16" />, image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&h=300&fit=crop", to: "/renovation" },
    { title: t('services.homeReady'), description: t('services.homeReadyDesc'), icon: <HomeService className="w-16 h-16" />, image: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?w=1280", to: "/home-preparation" }
  ];

  const getSettings = async ()=>{
    const res = await getDoc(doc(db,"settings", "pricing"));
    console.log(res.data());
    
    setPricing(res.data());
  }

  useEffect(()=>{
    getSettings();
  },[])


const qualityLevels = [
  {
    name: t('quality.standard'),
    description: t('quality.standardDesc'),
    icon: <Shield className="w-6 h-6" />,
    warranty: t('quality.warranty1'),
    price: t('qualityPages.standard.price', {value : pricing?.standard ||0}),
    suitable: t('qualityPages.standard.suitable'),
    accentColor: 'border-t-blue-500',
    iconColor: 'text-blue-500 bg-blue-50',
    priceColor: 'text-blue-600',
    features: [
      t('qualityPages.standard.f1'),
      t('qualityPages.standard.f2'),
      t('qualityPages.standard.f3'),
      t('qualityPages.standard.f4'),
    ],
    guarantees: [t('qualityPages.standard.g1'), t('qualityPages.standard.g2')],
  },
  {
    name: t('quality.plus'),
    description: t('quality.plusDesc'),
    icon: <Star className="w-6 h-6" />,
    recommended: true,
    warranty: t('quality.warranty2'),
    price: t('qualityPages.plus.price' , {value : pricing?.plus ||0 }),
    suitable: t('qualityPages.plus.suitable'),
    accentColor: 'border-t-[#f2a057]',
    iconColor: 'text-[#f2a057] bg-orange-50',
    priceColor: 'text-[#f2a057]',
    features: [
      t('qualityPages.plus.f1'),
      t('qualityPages.plus.f2'),
      t('qualityPages.plus.f3'),
      t('qualityPages.plus.f4'),
    ],
    guarantees: [t('qualityPages.plus.g1'), t('qualityPages.plus.g2'), t('qualityPages.plus.g3')],
  },
  {
    name: t('quality.premium'),
    description: t('quality.premiumDesc'),
    icon: <Crown className="w-6 h-6" />,
    warranty: t('quality.warranty3'),
    price: t('qualityPages.premium.price' , {value : pricing?.premium || 0}),
    suitable: t('qualityPages.premium.suitable'),
    accentColor: 'border-t-blue-950',
    iconColor: 'text-blue-950 bg-blue-50',
    priceColor: 'text-blue-950',
    features: [
      t('qualityPages.premium.f1'),
      t('qualityPages.premium.f2'),
      t('qualityPages.premium.f3'),
      t('qualityPages.premium.f4'),
    ],
    guarantees: [t('qualityPages.premium.g1'), t('qualityPages.premium.g2'), t('qualityPages.premium.g3')],
  }
];
const [visible, setVisible] = useState(false);
    const [activeStep, setActiveStep] = useState(-1);
    const sectionRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          [0,1,2,3,4].forEach(i => setTimeout(() => setActiveStep(i), i * 180 + 200));
        }
      }, { threshold: 0.2 });
      if (sectionRef.current) observer.observe(sectionRef.current);
      return () => observer.disconnect();
    }, []);

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* HERO */}
      <section id="home" className="relative w-full min-h-screen pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/30 z-10" />
          <img src={hero} className="w-full h-full object-cover scale-105 animate-slow-zoom" alt="hero" />
          <div className="absolute inset-0 bg-black/20 z-5" />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#f2a057]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="relative z-20 h-full flex items-center justify-center w-full min-h-screen">
          <div className="max-w-full px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-10 leading-tight">
              {t('hero.title')}
              <span className="text-[#f2a057] relative inline-block mx-2">
                {t('hero.titleHighlight')}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#f2a057] to-transparent rounded-full" />
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed backdrop-blur-sm bg-black/10 p-6 rounded-2xl border-l-4 border-[#f2a057]">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center gap-4 mb-12">
              <a href="/quote" className="group">
                <button className="w-full px-8 py-4 bg-[#f2a057] text-white text-lg font-bold rounded-lg shadow-lg hover:bg-orange-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  {t('hero.freeQuote')} <Arrow className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
              <a href="#services" className="group">
                <button className="w-full px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-bold rounded-lg shadow-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2">
                  {t('hero.ourServices')} <Arrow className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-4">{t('services.title')}</h2>
            <div className="w-24 h-1 bg-[#f2a057] mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('services.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
                 
              
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 group">
                <Link to={service.to}>
                <div className="h-48 overflow-hidden relative">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent flex items-end justify-center pb-4">
                    <div className="text-white">{service.icon}</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-blue-950 mb-2">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>  </Link>
              </div>
            
            ))}
          </div>
        </div>
      </section>

      {/* QUALITY LEVELS */}
<section id="quality" className="py-20 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-4">{t('quality.title')}</h2>
      <div className="w-24 h-1 bg-[#f2a057] mx-auto mb-6" />
      <p className="text-gray-500 text-lg max-w-2xl mx-auto">{t('quality.subtitle')}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
      {qualityLevels.map((level, index) => (
        <div
          key={index}
  className={`relative bg-white rounded-2xl border-t-4 ${level.accentColor} shadow-sm hover:shadow-lg transition-all duration-300`}
        >
          {/* Popular Badge */}
          {level.recommended && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#f2a057] text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                ⭐ {t('quality.mostPopular')}
              </span>
            </div>
          )}

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4 pt-2">
              <div>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${level.iconColor} mb-3`}>
                  {level.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-950">{level.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{level.description}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap mr-2">
                {level.warranty}
              </span>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-400 mb-1">{t('qualityPages.priceRange')}</p>
              <p className={`text-2xl font-extrabold ${level.priceColor}`}>{level.price}</p>
              <p className="text-xs text-gray-400 mt-1">{t('qualityPages.suitable')}: <span className="text-gray-600 font-medium">{level.suitable}</span></p>
            </div>

            {/* Features */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('qualityPages.featuresTitle')}</p>
              <ul className="space-y-2.5">
                {level.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#f2a057] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-100 mb-5" />

            {/* Guarantees */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('qualityPages.guaranteesTitle')}</p>
              <ul className="space-y-2">
                {level.guarantees.map((g, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-500 text-xs">{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <a href="/quote">
              <button className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                level.recommended
                  ? 'bg-[#f2a057] hover:bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-blue-950'
              }`}>
                {t('qualityPages.cta')}
              </button>
            </a>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-4">{t('features.title')}</h2>
            <div className="w-24 h-1 bg-[#f2a057] mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-white flex flex-col items-center rounded-2xl transition duration-300 shadow-md">
                <div className="text-[#f2a057] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-blue-950 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={sectionRef} className="py-20 bg-white">
  <style>{`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes popIn {
      0%   { opacity: 0; transform: scale(0.5); }
      70%  { transform: scale(1.12); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes dash {
      from { stroke-dashoffset: 16; }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes nudge {
      0%, 100% { transform: translateX(0); }
      50%       { transform: translateX(4px); }
    }
  `}</style>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Header — نفسه بالظبط + fadeUp */}
    <div
      className="text-center mb-16"
      style={{ opacity: visible ? 1 : 0, animation: visible ? "fadeUp 0.6s ease forwards" : "none" }}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-4">{t('howItWorks.title')}</h2>
      <div className="w-24 h-1 bg-[#f2a057] mx-auto mb-6" />
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('howItWorks.subtitle')}</p>
    </div>

    {/* Steps — grid بس على موبايل، flex مع أسهم على desktop */}
    <div className="flex flex-col md:flex-row items-start justify-center gap-0">
      {[
        { step: "1", title: t('howItWorks.step1'), desc: t('howItWorks.step1Desc') },
        { step: "2", title: t('howItWorks.step2'), desc: t('howItWorks.step2Desc') },
        { step: "3", title: t('howItWorks.step3'), desc: t('howItWorks.step3Desc') },
        { step: "4", title: t('howItWorks.step4'), desc: t('howItWorks.step4Desc') },
        { step: "5", title: t('howItWorks.step5'), desc: t('howItWorks.step5Desc') },
      ].map((item, index) => (
        <div key={index} className="flex flex-row md:flex-row items-center flex-1">

          {/* Step — نفس الشكل القديم + أنيميشن */}
          <div
            className="text-center flex-1"
            style={{
              opacity: activeStep >= index ? 1 : 0,
              animation: activeStep >= index ? "fadeUp 0.5s ease forwards" : "none",
            }}
          >
            <div
              className="w-16 h-16 bg-[#f2a057] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
              style={{
                animation: activeStep >= index
                  ? "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards"
                  : "none",
              }}
            >
              {item.step}
            </div>
            <h3 className="text-lg font-bold text-blue-950 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>

          {/* Arrow — بس مش بعد آخر step */}
          {index < 4 && (
  <div className="hidden md:flex items-center justify-center flex-shrink-0" style={{ width: 44, marginTop: -40 }}>
    <svg width="44" height="16" viewBox="0 0 44 16" fill="none">
      {/* الخط — قصير وما يوصلش للسهم */}
      <line
        x1={isRTL ? "34" : "10"} y1="8"
        x2={isRTL ? "16" : "28"} y2="8"
        stroke="#f2a057" strokeWidth="2" strokeDasharray="4 3"
        style={{ animation: activeStep >= index ? "dash 1s linear infinite" : "none" }}
      />
      {/* السهم منفصل عن الخط */}
      <polyline
        points={isRTL ? "14,3 4,8 14,13" : "30,3 40,8 30,13"}
        fill="none" stroke="#f2a057" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: activeStep >= index ? "nudge 1s ease-in-out infinite" : "none" }}
      />
    </svg>
  </div>
)}
        </div>
      ))}
    </div>

    {/* CTA — نفسه بالظبط */}
    <div
      className="text-center mt-12"
      style={{ opacity: visible ? 1 : 0, animation: visible ? "fadeUp 0.6s ease 1s forwards" : "none" }}
    >
      <a href="/quote">
        <button className="px-10 py-4 bg-[#f2a057] text-white text-lg font-bold rounded-lg shadow-lg hover:bg-orange-600 transform hover:scale-105 transition">
          {t('howItWorks.startNow')}
        </button>
      </a>
    </div>

  </div>
</section>

      <Footer />
    </div>
  );
}

export default HomePage;