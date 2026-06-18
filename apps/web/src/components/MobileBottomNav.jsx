import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Image as ImageIcon, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const MobileBottomNav = () => {
  const location = useLocation();

  const items = [
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'PDF Tools',
      path: '/pdf',
      icon: FileText,
    },
    {
      label: 'Image Tools',
      path: '/image',
      icon: ImageIcon,
    },
    {
      label: 'Encryptor',
      path: '/encrypt',
      icon: Lock,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/90 backdrop-blur-xl border-t border-border/80 px-4 py-2 flex items-center justify-around shadow-lg pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
      {items.map((item) => {
        // Match active paths (exact for dashboard, prefix for sub-routes)
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center space-y-1 px-3 py-1 rounded-xl transition-all duration-200 relative ${
              isActive
                ? 'text-primary scale-105 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5px]' : ''}`} />
            </motion.div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
};
