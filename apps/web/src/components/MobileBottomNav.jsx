import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Image as ImageIcon, Lock } from 'lucide-react';

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
            className={`flex flex-col items-center justify-center space-y-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-primary scale-105 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className="w-5.5 h-5.5 transition-transform duration-200" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
