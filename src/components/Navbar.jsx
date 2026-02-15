import React, { useState } from 'react';
import { Menu, X, Home, Users, Briefcase, FolderOpen, Phone } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');

  // قائمة الروابط مع الأيقونات (اختياري)
  const navLinks = [
    { name: 'Startseite', path: '/', icon: Home },
  
    { name: 'Kontakt', path: '#', icon: Phone }
  ];

  const handleLinkClick = (path) => {
    setActiveLink(path);
    setIsOpen(false);
  };

  return (
    <nav className="w-full bg-white shadow-md fixed h-[100px] top-0 left-0 right-0 z-50" >
      <div className="container mx-auto  py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a 
            href="/" 
            className="text-3xl font-black text-slate-900 tracking-tight group"
            onClick={() => handleLinkClick('/')}
          >
           <img src='https://enohm.net/wp-content/uploads/2024/06/cropped-gif.webp' className='w-[200px] h-[45px] '  />
          </a>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8 font-semibold text-start" >
            {navLinks.map((link) => (
              <li key={link.path}>
                <a 
                  href={link.path} 
                  onClick={() => handleLinkClick(link.path)}
                  className={`
                    transition-colors duration-300 relative group
                    ${activeLink === link.path 
                      ? 'text-[#f2a057] border-2 border-[#f2a057]  px-2 py-1' 
                      : 'text-slate-700 hover:text-blue-600'
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
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <ul className="md:hidden flex flex-col gap-2 mt-4 py-4 border-t border-slate-200 animate-slide-down" dir="rtl">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.path}>
                  <a 
                    href={link.path} 
                    onClick={() => handleLinkClick(link.path)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all
                      ${activeLink === link.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </a>
                </li>
              );
            })}
            <li className="mt-2">
              <a 
                href="/quote" 
                onClick={() => handleLinkClick('/quote')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-900 to-blue-900 text-white text-center font-bold rounded-lg shadow-lg"
              >
                اطلب عرض سعر
              </a>
            </li>
          </ul>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;