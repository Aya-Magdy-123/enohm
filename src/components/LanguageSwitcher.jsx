import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'de' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <div className="flex items-center gap-2 rounded-lg p-1">
      <button
        onClick={changeLanguage}
        className="px-4 py-1.5 rounded-md border border-[#f2a057] cursor-pointer font-semibold transition bg-white text-[#f2a057]  hover:outline-2"
      >
        {/* <Globe className="w-4 h-4" /> */}
        {i18n.language === 'ar' ? 'DE' : 'AR'}
      </button>
    </div>
  );
}

export default LanguageSwitcher;