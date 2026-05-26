import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PdfCompressPage from './pages/PdfCompressPage.jsx';
import PdfMergePage from './pages/PdfMergePage.jsx';
import ImageCompressPage from './pages/ImageCompressPage.jsx';
import FileEncryptPage from './pages/FileEncryptPage.jsx';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pdf" element={<PdfCompressPage />} />
        <Route path="/pdf/merge" element={<PdfMergePage />} />
        <Route path="/image" element={<ImageCompressPage />} />
        <Route path="/images" element={<ImageCompressPage />} />
        <Route path="/png" element={<ImageCompressPage />} />
        <Route path="/jpg" element={<ImageCompressPage />} />
        <Route path="/encrypt" element={<FileEncryptPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;