import React, { lazy, Suspense } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { Toaster } from './components/ui/sonner.jsx';
import { ThemeProvider } from 'next-themes';
import { GlobalDropZone } from './components/GlobalDropZone.jsx';
import { MobileBottomNav } from './components/MobileBottomNav.jsx';

// Lazy load pages to optimize initial bundle size
const PdfCompressPage = lazy(() => import('./pages/PdfCompressPage.jsx'));
const PdfMergePage = lazy(() => import('./pages/PdfMergePage.jsx'));
const PdfSplitPage = lazy(() => import('./pages/PdfSplitPage.jsx'));
const PdfToImagePage = lazy(() => import('./pages/PdfToImagePage.jsx'));
const PdfProtectPage = lazy(() => import('./pages/PdfProtectPage.jsx'));
const ImageCompressPage = lazy(() => import('./pages/ImageCompressPage.jsx'));
const ImageToPdfPage = lazy(() => import('./pages/ImageToPdfPage.jsx'));
const ImageConvertPage = lazy(() => import('./pages/ImageConvertPage.jsx'));
const FileEncryptPage = lazy(() => import('./pages/FileEncryptPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage.jsx'));

// Premium full-page loading screen
const PageLoader = () => (
  <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md space-y-6">
    <div className="relative flex items-center justify-center">
      {/* Outer spinning ring */}
      <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
      {/* Inner pulsing dot */}
      <div className="absolute w-8 h-8 rounded-lg bg-primary/20 animate-pulse flex items-center justify-center">
        <div className="w-3 h-3 rounded bg-primary" />
      </div>
    </div>
    
    <div className="space-y-1.5 text-center">
      <h3 className="text-lg font-bold tracking-tight text-foreground">Loading CompressBit Tool</h3>
      <p className="text-xs text-muted-foreground animate-pulse">Initializing secure client-side workspace...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Router>
        <GlobalDropZone>
          <ScrollToTop />
          <Toaster />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/pdf" element={<PdfCompressPage />} />
              <Route path="/pdf/merge" element={<PdfMergePage />} />
              <Route path="/pdf/split" element={<PdfSplitPage />} />
              <Route path="/pdf/to-image" element={<PdfToImagePage />} />
              <Route path="/pdf/protect" element={<PdfProtectPage />} />
              <Route path="/image" element={<ImageCompressPage />} />
              <Route path="/images" element={<ImageCompressPage />} />
              <Route path="/png" element={<ImageCompressPage />} />
              <Route path="/jpg" element={<ImageCompressPage />} />
              <Route path="/image/to-pdf" element={<ImageToPdfPage />} />
              <Route path="/image/convert" element={<ImageConvertPage />} />
              <Route path="/encrypt" element={<FileEncryptPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <MobileBottomNav />
        </GlobalDropZone>
      </Router>
    </ThemeProvider>
  );
}

export default App;