import React, { useState } from 'react';
import { Menu, X, Home, Users, Briefcase, FolderOpen, Phone, Wrench, Award, Star } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import logo from "/logo.webp"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
 
  const{t}= useTranslation();
  // قائمة الروابط مع الأيقونات (اختياري)
  const navLinks = [
    { name: t("nav.home"), path: '/', icon: Home },
    { name: t("nav.services"), path: '/#services', icon: Wrench },
    { name: t("nav.quality"), path: '/#quality', icon: Award },
    { name: t("nav.features"), path: '/#features', icon: Star },
    { name: t("nav.contact"), path: '/#contact', icon: Phone }
  ];

  const handleLinkClick = (path) => {
    setActiveLink(path);
    setIsOpen(false);
  };

  return (

 <nav className="bg-white shadow-md fixed w-full top-0 z-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-20">
             <div className="flex items-center w-full  justify-between">
          {/* Logo */}
          <a 
            href="/" 
            className="text-3xl font-black text-slate-900 tracking-tight group"
            onClick={() => handleLinkClick('/')}
          >
           <img src={logo} className='w-[200px] h-[45px] '  />
          </a>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center  gap-10 font-semibold " >
            {navLinks.map((link) => (
              <li key={link.path}>
                <a 
                  href={link.path} 
                  onClick={() => handleLinkClick(link.path)}
                  className={`
                    transition-colors duration-300 relative group
                    ${activeLink === link.path 
                      ? 'text-[#f2a057] border-2 border-[#f2a057]  px-2 py-1' 
                      : 'text-slate-700 hover:text-[#f2a057]'
                    }
                  `}
                >
                  {link.name}
                  
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {isOpen && (
            <ul className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start gap-4 py-4 px-5 lg:hidden">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <a 
                    href={link.path} 
                    onClick={() => handleLinkClick(link.path)}
                    className={`
                      transition-colors duration-300 relative group
                      ${activeLink === link.path 
                        ? 'text-[#f2a057] border-2 border-[#f2a057]  px-2 py-1' 
                        : 'text-slate-700 hover:text-[#f2a057]'
                      }
                    `}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <div className='flex text-[11px] items-center gap-1'>
                <Link to="/login" className="bg-slate-800 text-white px-6 py-2 cursor-pointer rounded-lg font-semibold hover:bg-slate-700 transition">
              {t("nav.login")}
            </Link>

          <a href="/quote">         
              <button className="bg-[#f2a057]  text-white px-6 py-2 cursor-pointer rounded-lg font-semibold hover:bg-orange-300 transition">
               {t("nav.getQuote")}
              </button>
            </a>
          <LanguageSwitcher/>
            </div>
            </ul>
          )}
           

          <div className=' items-center gap-2 hidden lg:flex'>
            <Link to="/login" className="bg-slate-800 text-white px-6 py-2 cursor-pointer rounded-lg font-semibold hover:bg-slate-700 transition">
              {t("nav.login")}
            </Link>

          <a href="/quote">
              <button className="bg-[#f2a057]  text-white px-6 py-2 cursor-pointer rounded-lg font-semibold hover:bg-orange-300 transition">
               {t("nav.getQuote")}
              </button>
            </a>
          <LanguageSwitcher/>
            </div>

        </div>
            

            
          </div>
        </div>
      </nav>

  
  );
}

export default Navbar;