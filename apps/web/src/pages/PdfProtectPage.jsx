import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Eye, EyeOff, Upload, FileText, X,
  CheckCircle2, Download, AlertCircle, RefreshCw, ShieldCheck, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { protectPdf } from '@/lib/pdf-protect-client.js';
import { getWebApplicationSchema } from '@/lib/seo-helper.js';
import { FAQAccordion } from '@/components/FAQAccordion.jsx';
import { trackEvent, trackPageView } from '@/lib/analytics.js';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0) + ' ' + units[i];
};

const getPasswordStrength = (pwd) => {
  if (!pwd) return { label: '', color: 'bg-transparent', score: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { label: 'Weak', color: 'bg-destructive', score };
  if (score === 2) return { label: 'Medium', color: 'bg-yellow-500', score };
  return { label: 'Strong', color: 'bg-emerald-500', score };
};

const PdfProtectPage = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [result, setResult] = useState(null); // { protectedBlob, fileName, protectedSize }
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);
  const pwdStrength = getPasswordStrength(password);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('/pdf/protect');
  }, []);

  useEffect(() => {
    if (location.state?.droppedFiles && location.state.droppedFiles.length > 0) {
      handleFileSelect(location.state.droppedFiles);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleFileSelect = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const selectedFile = selectedFiles[0];

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size exceeds the 100MB limit.');
      return;
    }

    setError('');
    setFile(selectedFile);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleProtect = async () => {
    if (!file || !password) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      toast.error('Password is too short.');
      return;
    }

    setIsEncrypting(true);
    setError('');

    try {
      // Small visual delay for nice feedback
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const res = await protectPdf(file, password);
      
      setResult({
        protectedBlob: res.protectedBlob,
        fileName: `protected-${file.name}`,
        protectedSize: res.protectedSize
      });

      trackEvent('pdf_protect_success', {
        strength: pwdStrength.label
      });
      
      toast.success('PDF successfully password-protected!');
    } catch (err) {
      const errMsg = err.message || 'Failed to protect PDF file.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsEncrypting(false);
    }
  };

  const triggerDownload = () => {
    if (!result) return;
    trackEvent('pdf_protect_download', {
      size: result.protectedBlob.size
    });
    const url = URL.createObjectURL(result.protectedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${result.fileName}`);
  };

  const handleReset = () => {
    trackEvent('pdf_protect_reset');
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Cleared PDF file');
  };

  const faqs = [
    {
      question: "How does PDF encryption work here?",
      answer: "We use standard Acrobat-compliant PDF encryption controls. When you set a password, the pdf-lib library encrypts the PDF document dictionary and content streams using the password as a key, completely locally in your browser memory."
    },
    {
      question: "Is it safe to enter my password on this web app?",
      answer: "Absolutely. CompressBit is a local-only utility application. Your files, passwords, and encryption parameters never leave your local browser tab and are never transmitted over the network."
    },
    {
      question: "Can I open the protected PDF in any reader?",
      answer: "Yes. The locked file matches standard PDF specifications, so all compliant viewers (like Adobe Acrobat Reader, Google Chrome, Safari, Preview on macOS, or mobile PDF applications) will prompt you for the password."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Protect PDF - Encrypt and Lock PDFs Free | CompressBit</title>
        <meta name="description" content="Add passwords and restrict permissions on your PDF documents instantly. 100% local browser encryption using standard Acrobat-compatible controls." />
        
        {/* Open Graph / Social Sharing Tags */}
        <meta property="og:title" content="Protect PDF - Encrypt and Lock PDFs Free | CompressBit" />
        <meta property="og:description" content="Add passwords and restrict permissions on your PDF documents instantly. 100% local browser encryption using standard Acrobat-compatible controls." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.compressbit.com/pdf/protect" />
        <meta property="og:image" content="https://www.compressbit.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Protect PDF - Encrypt and Lock PDFs Free | CompressBit" />
        <meta name="twitter:description" content="Add passwords and restrict permissions on your PDF documents instantly. 100% local browser encryption using standard Acrobat-compatible controls." />
        <meta name="twitter:image" content="https://www.compressbit.com/og-image.png" />
        
        <script type="application/ld+json">
          {JSON.stringify(getWebApplicationSchema(
            "PDF Encryptor",
            "/pdf/protect",
            "Add passwords and restrict permissions on your PDF documents instantly. 100% local browser encryption using standard Acrobat-compatible controls."
          ))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />

        <main className="flex-grow pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center space-y-4 mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Protect PDF
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Secure your PDF files with official Adobe-standard password protection. <br className="hidden md:block" />
                Runs 100% client-side. <span className="text-primary font-semibold">Privacy guaranteed.</span>
              </p>
            </div>

            {/* Interactive Card */}
            <Card className="bg-card/50 border-border backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                
                {/* Upload or Configure Flow */}
                {!result && !isEncrypting && (
                  <motion.div
                    key="config-flow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {!file ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <Upload className="w-7 h-7 text-primary" />
                          </div>
                          <h3 className="font-bold text-lg">Select PDF file</h3>
                          <p className="text-sm text-muted-foreground mt-1">Drag and drop your PDF here (Up to 100MB)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="truncate pr-4">
                            <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleReset}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl w-8 h-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Configure Password Inputs */}
                    {file && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-2"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-muted-foreground">PDF Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter protection password..."
                              className="w-full h-12 bg-muted border border-border rounded-xl px-4 pr-12 focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>

                          {/* Password Strength */}
                          {password && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-muted-foreground">Strength:</span>
                                <span className={pwdStrength.score > 2 ? 'text-emerald-500' : pwdStrength.score === 2 ? 'text-yellow-500' : 'text-destructive'}>
                                  {pwdStrength.label}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex gap-0.5">
                                {[1, 2, 3, 4].map((i) => (
                                  <div
                                    key={i}
                                    className={`h-full flex-1 transition-colors duration-300 ${
                                      i <= pwdStrength.score ? pwdStrength.color : 'bg-muted-foreground/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-muted-foreground">Confirm Password</label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password to confirm..."
                            className="w-full h-12 bg-muted border border-border rounded-xl px-4 focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                          />
                        </div>

                        {error && (
                          <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 border border-destructive/20 rounded-xl">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                          </div>
                        )}

                        <div className="flex gap-4 pt-4">
                          <Button
                            size="lg"
                            className="flex-grow bg-primary hover:bg-primary/95 text-lg h-14 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                            onClick={handleProtect}
                            disabled={!password || !confirmPassword}
                          >
                            <Lock className="w-5 h-5 mr-2" />
                            Protect PDF
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={handleReset}
                            className="bg-card border-border h-14 rounded-xl px-6"
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Progress UI */}
                {isEncrypting && (
                  <motion.div
                    key="progress-flow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-10 space-y-6"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-bold text-lg">Encrypting PDF document...</h3>
                      <p className="text-sm text-muted-foreground">Injecting security blocks and locking file layout...</p>
                    </div>
                  </motion.div>
                )}

                {/* Success Display */}
                {result && !isEncrypting && (
                  <motion.div
                    key="success-flow"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center space-y-6 py-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">PDF Locked Successfully!</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Your file has been secured using industry-standard PDF user security. Standard PDF readers will require the password you provided to view it.
                      </p>
                    </div>

                    <div className="bg-muted border border-border p-4 rounded-2xl w-full max-w-md text-left space-y-2">
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Encrypted PDF File</div>
                      <div className="font-bold text-sm truncate">{result.fileName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatSize(result.protectedSize)} • PDF Protection
                      </div>
                    </div>

                    <div className="flex gap-4 w-full max-w-md pt-2">
                      <Button
                        onClick={triggerDownload}
                        className="flex-grow bg-primary hover:bg-primary/90 h-12 rounded-xl"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Protected PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="bg-card border-border h-12 rounded-xl"
                      >
                        Lock Another
                      </Button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </Card>            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-card/30 border border-border p-5 rounded-2xl space-y-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <h4 className="font-bold text-sm text-foreground">Acrobat Standards</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Encryption strictly matches standard PDF security policies. Compatible with Acrobat, Chrome, Preview, iOS, and Android.
                </p>
              </div>
              <div className="bg-card/30 border border-border p-5 rounded-2xl space-y-2">
                <Lock className="w-6 h-6 text-primary" />
                <h4 className="font-bold text-sm text-foreground">Secure Locks</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Locks the PDF with solid symmetric cipher parameters, making the document contents unreadable without inputting the correct user password.
                </p>
              </div>
              <div className="bg-card/30 border border-border p-5 rounded-2xl space-y-2">
                <Zap className="w-6 h-6 text-primary" />
                <h4 className="font-bold text-sm text-foreground">WebAssembly Execution</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Powered by fast local memory-efficient processing of `pdf-lib` so compilation is quick and completely private.
                </p>
              </div>
            </div>

            <FAQAccordion faqs={faqs} />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PdfProtectPage;
