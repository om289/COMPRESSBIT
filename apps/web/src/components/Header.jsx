import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, FileText, ChevronDown, Image as ImageIcon, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'PDF Compressor', path: '/pdf', icon: FileText },
    { name: 'Image Compressor', path: '/image', icon: ImageIcon },
  ];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 overflow-hidden rounded-[0.6rem] shadow-sm">
              <img src="/apple-touch-icon.png" alt="CompressBit Logo" className="w-full h-full object-cover scale-[1.25]" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">CompressBit</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/png' && location.pathname === '/jpg');
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg flex items-center gap-2 ${
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
            
            <div className="w-px h-6 bg-border mx-4" />
            
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-primary/20 hover:bg-primary/5 text-primary flex items-center gap-2"
            >
              <a href="https://github.com/om289/COMPRESSBIT" target="_blank" rel="noopener noreferrer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.37 4.37 0 0 0 9 18v4"></path>
                </svg>
                GitHub Code
              </a>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path === '/png' && location.pathname === '/jpg');
                return (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.path)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </button>
                );
              })}
              
              <div className="pt-4 mt-4 border-t border-border">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  onClick={() => handleNavClick('/')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;