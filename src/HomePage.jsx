import { Home, Wrench, Shield, Clock, Award, Users, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, CheckCircle, Building2, Paintbrush, HardHat, Home as HomeService } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import hero from "/hero.jpg";

function HomePage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const features = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: t('features.highQuality'),
      description: t('features.highQualityDesc')
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: t('features.onTimeDelivery'),
      description: t('features.onTimeDeliveryDesc')
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: t('features.longExperience'),
      description: t('features.longExperienceDesc')
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: t('features.professionalTeam'),
      description: t('features.professionalTeamDesc')
    },
    {
      icon: <Wrench className="w-12 h-12" />,
      title: t('features.comprehensiveServices'),
      description: t('features.comprehensiveServicesDesc')
    },
    {
      icon: <Home className="w-12 h-12" />,
      title: t('features.customSolutions'),
      description: t('features.customSolutionsDesc')
    }
  ];

  const services = [
    {
      title: t('services.construction'),
      
      description: t('services.constructionDesc'),
      icon: <Building2 className="w-16 h-16" />,
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&h=300&fit=crop"
    },
    {
      title: t('services.finishing'),
     
      description: t('services.finishingDesc'),
      icon: <Paintbrush className="w-16 h-16" />,
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=300&fit=crop"
    },
    {
      title: t('services.renovation'),
      
      description: t('services.renovationDesc'),
      icon: <HardHat className="w-16 h-16" />,
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&h=300&fit=crop"
    },
    {
      title: t('services.homeReady'),
      
      description: t('services.homeReadyDesc'),
      icon: <HomeService className="w-16 h-16" />,
      image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=500&h=300&fit=crop"
    }
  ];

  const qualityLevels = [
    {
      name: t('quality.standard'),
      
      description: t('quality.standardDesc'),
      features: [t('quality.certifiedMaterials'), t('quality.experiencedTeam')]
    },
    {
      name: t('quality.plus'),
      
      description: t('quality.plusDesc'),
      features: [t('quality.excellentMaterials'), t('quality.continuousSupervision')],
      recommended: true
    },
    {
      name: t('quality.premium'),
      
      description: t('quality.premiumDesc'),
      features: [t('quality.luxuryMaterials'), t('quality.vipService')]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar/>

      {/* HERO SECTION */}
      <section id="home" className="relative w-full min-h-screen pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/30 z-10"></div>
          <img
            src={hero}
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            alt="Construction background"
          />
          <div className="absolute inset-0 bg-black/20 z-5"></div>
        </div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-[#f2a057]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-20 h-full flex items-center justify-center w-full min-h-screen">
          <div className="max-w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-full" data-aos="fade-up" data-aos-duration="1000">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-10 leading-tight">
                {t('hero.title')}
                <span className="text-[#f2a057] relative inline-block mx-2">
                  {t('hero.titleHighlight')}
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#f2a057] to-transparent rounded-full"></div>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed backdrop-blur-sm bg-black/10 p-6 rounded-2xl border-l-4 border-[#f2a057]">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row sm:justify-center gap-4 mb-12">
                <a href="/quote" className="group">
                  <button className="w-full px-8 py-4 bg-[#f2a057] cursor-pointer text-white text-lg font-bold rounded-lg shadow-lg hover:bg-orange-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group">
                    <span className="relative z-10">{t('hero.freeQuote')}</span>
                    <span className="relative z-10 group-hover:translate-x-1 transition-transform">{isRTL ? '←' : '→'}</span>
                  </button>
                </a>
                <a href="#services" className="group">
                  <button className="w-full px-8 py-4 cursor-pointer bg-white/10 backdrop-blur-sm text-white text-lg font-bold rounded-lg shadow-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2">
                    {t('hero.ourServices')}
                    <span className="group-hover:translate-x-1 transition-transform">{isRTL ? '←' : '→'}</span>
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-4">
              {t('services.title')}
            </h2>
            <div className="w-24 h-1 bg-[#f2a057] mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent flex items-end justify-center pb-4">
                    <div className="text-white">
                      {service.icon}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-blue-950 mb-2">
                    {service.title}
                  </h3>
                
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUALITY LEVELS SECTION */}
      <section id="quality" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-4">
              {t('quality.title')}
            </h2>
            <div className="w-24 h-1 bg-[#f2a057] mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('quality.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {qualityLevels.map((level, index) => (
              <div 
                key={index}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200"
              >
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-blue-950 mb-2">
                    {level.name}
                  </h3>
                 
                  <p className="text-gray-600 mt-4">
                    {level.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {level.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className={`w-5 h-5 text-[#f2a057] ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-4">
              {t('features.title')}
            </h2>
            <div className="w-24 h-1 bg-[#f2a057] mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 bg-white flex flex-col items-center rounded-2xl transition duration-300 shadow-md"
              >
                <div className="text-[#f2a057] transition mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-950 transition mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 transition leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-950 mb-4">
              {t('howItWorks.title')}
            </h2>
            <div className="w-24 h-1 bg-[#f2a057] mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: "1", title: t('howItWorks.step1'), desc: t('howItWorks.step1Desc') },
              { step: "2", title: t('howItWorks.step2'), desc: t('howItWorks.step2Desc') },
              { step: "3", title: t('howItWorks.step3'), desc: t('howItWorks.step3Desc') },
              { step: "4", title: t('howItWorks.step4'), desc: t('howItWorks.step4Desc') },
              { step: "5", title: t('howItWorks.step5'), desc: t('howItWorks.step5Desc') }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#f2a057] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-blue-950 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/quote">
              <button className="px-10 py-4 bg-[#f2a057] text-white text-lg font-bold rounded-lg shadow-lg hover:bg-orange-600 transform hover:scale-105 transition">
                {t('howItWorks.startNow')}
              </button>
            </a>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

export default HomePage;