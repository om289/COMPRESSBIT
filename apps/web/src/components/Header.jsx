import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, FileText, ChevronDown, Image as ImageIcon, LayoutDashboard, Layers, Lock, Scissors, Sun, Moon, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
      name: 'PDF Tools',
      icon: FileText,
      submenu: [
        { name: 'Compress PDF', path: '/pdf', icon: FileText },
        { name: 'Merge PDF', path: '/pdf/merge', icon: Layers },
        { name: 'Split PDF', path: '/pdf/split', icon: Scissors },
        { name: 'PDF to Image', path: '/pdf/to-image', icon: ImageIcon },
        { name: 'Protect PDF', path: '/pdf/protect', icon: Lock },
      ]
    },
    {
      name: 'Image Tools',
      icon: ImageIcon,
      submenu: [
        { name: 'Compress Image', path: '/image', icon: ImageIcon },
        { name: 'Image to PDF', path: '/image/to-pdf', icon: FileText },
        { name: 'Convert Image', path: '/image/convert', icon: Layers },
      ]
    },
    { name: 'File Encryptor', path: '/encrypt', icon: Lock },
    { name: 'Blog', path: '/blog', icon: BookOpen },
  ];

  // Mobile flat list
  const mobileLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Compress PDF', path: '/pdf', icon: FileText },
    { name: 'Merge PDF', path: '/pdf/merge', icon: Layers },
    { name: 'Split PDF', path: '/pdf/split', icon: Scissors },
    { name: 'PDF to Image', path: '/pdf/to-image', icon: ImageIcon },
    { name: 'Protect PDF', path: '/pdf/protect', icon: Lock },
    { name: 'Compress Image', path: '/image', icon: ImageIcon },
    { name: 'Image to PDF', path: '/image/to-pdf', icon: FileText },
    { name: 'Convert Image', path: '/image/convert', icon: Layers },
    { name: 'File Encryptor', path: '/encrypt', icon: Lock },
    { name: 'Blog', path: '/blog', icon: BookOpen },
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
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              if (link.submenu) {
                const isSubActive = link.submenu.some(sub => location.pathname === sub.path);
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(link.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors duration-200 ${
                        isSubActive
                          ? 'text-primary bg-primary/10 font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        openDropdown === link.name ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    <AnimatePresence>
                      {openDropdown === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-52 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl p-1.5 z-50"
                        >
                          {link.submenu.map((sub) => {
                            const isSubActive = location.pathname === sub.path;
                            return (
                              <motion.div
                                key={sub.name}
                                whileHover={{ x: 4 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              >
                                <Link
                                  to={sub.path}
                                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                    isSubActive
                                      ? 'text-primary bg-primary/10 font-semibold'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                  }`}
                                >
                                  <sub.icon className="w-4 h-4" />
                                  {sub.name}
                                </Link>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg flex items-center gap-1.5 ${
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
            
            <div className="w-px h-6 bg-border mx-2" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted w-9 h-9"
              title="Toggle Theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
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
            <div className="px-4 py-4 space-y-1.5 max-h-[80vh] overflow-y-auto">
              {mobileLinks.map((link) => {
                const isActive = location.pathname === link.path;
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
              
              <div className="pt-3 mt-3 border-t border-border flex items-center justify-between px-4">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-2 rounded-xl bg-card border-border px-3 py-1.5 text-xs font-semibold"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-primary" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-primary" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-3 mt-3 border-t border-border">
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
