import  { useState } from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);



  return (
    <div className="flex items-center relative gap-2 rounded-lg p-1">

      <button
        onClick={()=> setIsOpen(true)}
        className="px-4 py-1.5 rounded-md border border-[#f2a057] cursor-pointer font-semibold transition bg-white text-[#f2a057]  hover:outline-2"
      >
        {/* <Globe className="w-4 h-4" /> */}
        {i18n.language === 'ar' ? 'العربية' : i18n.language === 'de' ? 'Deutsch' : 'English'}
      </button>
      {isOpen && (
        <div className="absolute mt-16 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <button
            onClick={() => {
              i18n.changeLanguage('ar');
              document.documentElement.dir = 'rtl';
              document.documentElement.lang = 'ar';
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            العربية
          </button>
          <button
            onClick={() => {
              i18n.changeLanguage('de');
              document.documentElement.dir = 'ltr';
              document.documentElement.lang = 'de';
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Deutsch
          </button>
          <button
            onClick={() => {
              i18n.changeLanguage('en');
              document.documentElement.dir = 'ltr';
              document.documentElement.lang = 'en';
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;