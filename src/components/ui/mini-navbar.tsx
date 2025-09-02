"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = 'text-gray-200';
  const hoverTextColor = 'text-white';
  const textSizeClass = 'text-sm font-medium';

  return (
    <Link to={href} className={`group relative inline-block flex items-center ${textSizeClass}`}>
      <div className="flex flex-col h-5 overflow-hidden transition-transform duration-400 ease-out group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </Link>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const navLinksData = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/#tools' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
  ];

  const logoElement = (
    <span className="text-xl font-bold text-white drop-shadow-sm">Easy Access Utilities</span>
  );

  return (
    <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-20
                       flex flex-col items-center
                       pl-6 pr-6 py-3 min-h-12 backdrop-blur-md
                       ${headerShapeClass}
                       border border-white/20 bg-black/70
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-[border-radius] duration-0 ease-in-out
                       shadow-lg shadow-black/20`}
      role="banner"
    >

      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8 min-h-12">
        <div className="flex items-center min-h-12">
           {logoElement}
        </div>

        <nav className="hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm min-h-12" role="navigation" aria-label="Main navigation">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <button className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded min-h-12 transition-colors" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-base w-full" role="navigation" aria-label="Mobile navigation">
          {navLinksData.map((link) => (
            <a key={link.href} href={link.href} className="text-gray-200 hover:text-white transition-colors w-full text-center focus:outline-none focus:ring-2 focus:ring-white/50 rounded font-medium py-1">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
} 