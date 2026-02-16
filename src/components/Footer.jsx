import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const quickLinks = [
    { name: t('nav.home'), path: '#home' },
    { name: t('nav.services'), path: '#services' },
    { name: t('nav.quality'), path: '#quality' },
    { name: t('nav.features'), path: '#features' },
    { name: t('nav.contact'), path: '#contact' }
  ];

  const services = [
    t('services.construction'),
    t('services.finishing'),
    t('services.renovation'),
    t('services.homeReady')
  ];

  return (
    <footer id="contact" className="bg-blue-950 text-white py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src="https://enohm.net/wp-content/uploads/2024/06/cropped-gif.webp" 
              className='w-[200px] h-[45px] mb-4' 
              alt="Enohm Logo"
            />
            <p className="text-gray-300 text-start leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-start text-start">
            <h3 className="text-xl font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.path} 
                    className="text-gray-300 hover:text-[#f2a057] transition"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="flex flex-col items-start text-start">
            <h3 className="text-xl font-bold mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index} className="text-gray-300">{service}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-start">
            <h3 className="text-xl font-bold mb-4">{t('footer.contactUs')}</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className={`w-5 h-5 text-[#f2a057] mt-1 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <p className="text-gray-300">{t('footer.address')}</p>
              </div>
              <div className="flex items-center">
                <Phone className={`w-5 h-5 text-[#f2a057] ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <p className="text-gray-300">{t('footer.phone')}</p>
              </div>
              <div className="flex items-center">
                <Mail className={`w-5 h-5 text-[#f2a057] ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <p className="text-gray-300">{t('footer.email')}</p>
              </div>
            </div>

            {/* Social Media */}
            <div className={`flex space-x-4 mt-6`}>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#f2a057] transition"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#f2a057] transition"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#f2a057] transition"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;