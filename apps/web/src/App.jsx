import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PdfCompressPage from './pages/PdfCompressPage.jsx';
import ImageCompressPage from './pages/ImageCompressPage.jsx';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pdf" element={<PdfCompressPage />} />
        <Route path="/image" element={<ImageCompressPage />} />
        <Route path="/png" element={<ImageCompressPage />} />
        <Route path="/jpg" element={<ImageCompressPage />} />
      </Routes>
    </Router>
  );
}

export default App;