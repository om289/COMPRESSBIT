import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Unlock, ShieldAlert, Key, Eye, EyeOff, Upload, FileText,
  X, CheckCircle2, Download, AlertCircle, RefreshCw, ShieldCheck, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { encryptFile, decryptFile } from '@/lib/file-encryptor-client.js';

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

const FileEncryptPage = () => {
  const [activeTab, setActiveTab] = useState('encrypt'); // 'encrypt' | 'decrypt'
  
  // Encrypt State
  const [encFile, setEncFile] = useState(null);
  const [encPassword, setEncPassword] = useState('');
  const [showEncPassword, setShowEncPassword] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encResult, setEncResult] = useState(null); // { blob, name, size }
  const [encError, setEncError] = useState('');
  const [isEncDragging, setIsEncDragging] = useState(false);
  const encFileInputRef = useRef(null);

  // Decrypt State
  const [decFile, setDecFile] = useState(null);
  const [decPassword, setDecPassword] = useState('');
  const [showDecPassword, setShowDecPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decResult, setDecResult] = useState(null); // { blob, name, size, type }
  const [decError, setDecError] = useState('');
  const [isDecDragging, setIsDecDragging] = useState(false);
  const decFileInputRef = useRef(null);

  const pwdStrength = getPasswordStrength(encPassword);

  // Drag and Drop (Encrypt)
  const handleEncDrop = (e) => {
    e.preventDefault();
    setIsEncDragging(false);
    if (e.dataTransfer.files.length > 0) {
      setEncFile(e.dataTransfer.files[0]);
      setEncResult(null);
      setEncError('');
    }
  };

  const handleEncFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setEncFile(e.target.files[0]);
      setEncResult(null);
      setEncError('');
    }
  };

  // Drag and Drop (Decrypt)
  const handleDecDrop = (e) => {
    e.preventDefault();
    setIsDecDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.enc')) {
        setDecError('Only encrypted .enc files are accepted for decryption.');
        return;
      }
      setDecFile(droppedFile);
      setDecResult(null);
      setDecError('');
    }
  };

  const handleDecFileSelect = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.enc')) {
        setDecError('Only encrypted .enc files are accepted for decryption.');
        return;
      }
      setDecFile(selectedFile);
      setDecResult(null);
      setDecError('');
    }
  };

  // Process Encrypt
  const handleEncrypt = async () => {
    if (!encFile || !encPassword) return;
    setIsEncrypting(true);
    setEncError('');
    
    try {
      // Small delay to show progress state
      await new Promise(r => setTimeout(r, 600));
      const res = await encryptFile(encFile, encPassword);
      setEncResult({
        blob: res.blob,
        name: res.name,
        size: res.blob.size,
        isStandardPdf: res.isStandardPdf
      });
    } catch (err) {
      setEncError(err.message || 'Encryption failed.');
    } finally {
      setIsEncrypting(false);
    }
  };

  // Process Decrypt
  const handleDecrypt = async () => {
    if (!decFile || !decPassword) return;
    setIsDecrypting(true);
    setDecError('');

    try {
      await new Promise(r => setTimeout(r, 600));
      const res = await decryptFile(decFile, decPassword);
      setDecResult(res);
    } catch (err) {
      setDecError(err.message || 'Decryption failed. Please check your password.');
    } finally {
      setIsDecrypting(false);
    }
  };

  // Download Trigger
  const triggerDownload = (result) => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Resets
  const resetEncrypt = () => {
    setEncFile(null);
    setEncPassword('');
    setEncResult(null);
    setEncError('');
  };

  const resetDecrypt = () => {
    setDecFile(null);
    setDecPassword('');
    setDecResult(null);
    setDecError('');
  };

  return (
    <>
      <Helmet>
        <title>File Encryptor - Secure Files Offline | CompressBit</title>
        <meta name="description" content="Secure files locally in your browser using AES-256 client-side encryption. Completely private, no uploads, no cloud storage." />
      </Helmet>

      <div className="dark min-h-screen bg-background text-foreground flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="text-center space-y-4 mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                File Encryptor
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Secure your confidential documents, images, and files with military-grade <span className="text-primary font-semibold">AES-256 encryption</span>. 
                Runs 100% in your browser.
              </p>
            </div>

            {/* Tab Switches */}
            <div className="flex justify-center mb-8">
              <div className="bg-muted p-1 rounded-2xl flex gap-1 border border-border">
                <button
                  onClick={() => { setActiveTab('encrypt'); setEncError(''); setDecError(''); }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'encrypt'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Encrypt File
                </button>
                <button
                  onClick={() => { setActiveTab('decrypt'); setEncError(''); setDecError(''); }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'decrypt'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  Decrypt File
                </button>
              </div>
            </div>

            {/* Main Interactive Card */}
            <Card className="bg-card/50 border-border backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl">
              <AnimatePresence mode="wait">
                {activeTab === 'encrypt' ? (
                  <motion.div
                    key="encrypt-pane"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {!encResult && !isEncrypting && (
                      <>
                        {/* Drag and Drop Zone */}
                        <div
                          onClick={() => encFileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsEncDragging(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setIsEncDragging(false); }}
                          onDrop={handleEncDrop}
                          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                            isEncDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <input
                            ref={encFileInputRef}
                            type="file"
                            onChange={handleEncFileSelect}
                            className="hidden"
                          />
                          {!encFile ? (
                            <div className="flex flex-col items-center">
                              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <Upload className="w-7 h-7 text-primary" />
                              </div>
                              <h3 className="font-bold text-lg">Select or drop any file</h3>
                              <p className="text-sm text-muted-foreground mt-1">Supports any document, photo, video, or archive up to 100MB</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                                <FileText className="w-7 h-7 text-emerald-500" />
                              </div>
                              <h3 className="font-bold text-lg truncate max-w-md">{encFile.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{formatSize(encFile.size)}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); setEncFile(null); }}
                                className="mt-4 text-destructive hover:bg-destructive/10 rounded-xl"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Remove File
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Password Fields */}
                        {encFile && (
                          <div className="space-y-3">
                            <label className="text-sm font-semibold text-muted-foreground">Encryption Password</label>
                            <div className="relative">
                              <input
                                type={showEncPassword ? 'text' : 'password'}
                                value={encPassword}
                                onChange={(e) => setEncPassword(e.target.value)}
                                placeholder="Enter a secure password..."
                                className="w-full h-12 bg-muted border border-border rounded-xl px-4 pr-12 focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => setShowEncPassword(!showEncPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showEncPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>

                            {/* Password Strength Meter */}
                            {encPassword && (
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
                        )}

                        {/* Action buttons */}
                        {encFile && encPassword && (
                          <Button
                            size="lg"
                            onClick={handleEncrypt}
                            className="w-full bg-primary hover:bg-primary/95 text-lg h-14 rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all"
                          >
                            <Lock className="w-5 h-5 mr-2" />
                            Encrypt and Download File
                          </Button>
                        )}
                      </>
                    )}

                    {/* Progress States */}
                    {isEncrypting && (
                      <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                          </div>
                        </div>
                        <div className="text-center space-y-1">
                          <h3 className="font-bold text-lg">Encrypting file...</h3>
                          <p className="text-sm text-muted-foreground">Computing hash and generating secure cipher block...</p>
                        </div>
                      </div>
                    )}

                    {/* Encryption Completed */}
                    {encResult && !isEncrypting && (
                      <div className="flex flex-col items-center text-center space-y-6 py-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">File Encrypted Successfully!</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Your secure encrypted file has been downloaded. Keep the password safe — it is impossible to recover your data without it.
                          </p>
                        </div>

                        <div className="bg-muted border border-border p-4 rounded-2xl w-full max-w-md text-left space-y-2">
                          <div className="text-xs text-muted-foreground font-semibold uppercase">Encrypted Output</div>
                          <div className="font-bold text-sm truncate">{encResult.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatSize(encResult.size)} • {encResult.isStandardPdf ? 'Standard PDF Security' : 'AES-256-GCM'}
                          </div>
                        </div>

                        <div className="flex gap-4 w-full max-w-md pt-2">
                          <Button
                            onClick={() => triggerDownload(encResult)}
                            className="flex-1 bg-primary hover:bg-primary/90 h-12 rounded-xl"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Again
                          </Button>
                          <Button
                            variant="outline"
                            onClick={resetEncrypt}
                            className="flex-1 bg-card border-border h-12 rounded-xl"
                          >
                            Encrypt Another
                          </Button>
                        </div>
                      </div>
                    )}

                    {encError && (
                      <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 border border-destructive/20 rounded-xl">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{encError}</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="decrypt-pane"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {!decResult && !isDecrypting && (
                      <>
                        {/* Drag and Drop Zone */}
                        <div
                          onClick={() => decFileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDecDragging(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setIsDecDragging(false); }}
                          onDrop={handleDecDrop}
                          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                            isDecDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <input
                            ref={decFileInputRef}
                            type="file"
                            accept=".enc"
                            onChange={handleDecFileSelect}
                            className="hidden"
                          />
                          {!decFile ? (
                            <div className="flex flex-col items-center">
                              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <Upload className="w-7 h-7 text-primary" />
                              </div>
                              <h3 className="font-bold text-lg">Select or drop an encrypted file</h3>
                              <p className="text-sm text-muted-foreground mt-1">Files must be of type `.enc` generated by CompressBit</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                <Lock className="w-7 h-7 text-blue-500" />
                              </div>
                              <h3 className="font-bold text-lg truncate max-w-md">{decFile.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{formatSize(decFile.size)}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); setDecFile(null); }}
                                className="mt-4 text-destructive hover:bg-destructive/10 rounded-xl"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Remove File
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Password input */}
                        {decFile && (
                          <div className="space-y-3">
                            <label className="text-sm font-semibold text-muted-foreground">Decryption Password</label>
                            <div className="relative">
                              <input
                                type={showDecPassword ? 'text' : 'password'}
                                value={decPassword}
                                onChange={(e) => setDecPassword(e.target.value)}
                                placeholder="Enter password to decrypt..."
                                className="w-full h-12 bg-muted border border-border rounded-xl px-4 pr-12 focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => setShowDecPassword(!showDecPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showDecPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        {decFile && decPassword && (
                          <Button
                            size="lg"
                            onClick={handleDecrypt}
                            className="w-full bg-primary hover:bg-primary/95 text-lg h-14 rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all"
                          >
                            <Unlock className="w-5 h-5 mr-2" />
                            Decrypt File
                          </Button>
                        )}
                      </>
                    )}

                    {/* Progress States */}
                    {isDecrypting && (
                      <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                          </div>
                        </div>
                        <div className="text-center space-y-1">
                          <h3 className="font-bold text-lg">Decrypting file...</h3>
                          <p className="text-sm text-muted-foreground">Verifying key integrity and unpacking blocks...</p>
                        </div>
                      </div>
                    )}

                    {/* Decryption Completed */}
                    {decResult && !isDecrypting && (
                      <div className="flex flex-col items-center text-center space-y-6 py-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">File Decrypted Successfully!</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Decrypted payloads derived successfully. You can download the restored file to your device.
                          </p>
                        </div>

                        <div className="bg-muted border border-border p-4 rounded-2xl w-full max-w-md text-left space-y-2">
                          <div className="text-xs text-muted-foreground font-semibold uppercase">Decrypted Result</div>
                          <div className="font-bold text-sm truncate">{decResult.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatSize(decResult.size)} • {decResult.type || 'Unknown Format'}
                          </div>
                        </div>

                        <div className="flex gap-4 w-full max-w-md pt-2">
                          <Button
                            onClick={() => triggerDownload(decResult)}
                            className="flex-1 bg-primary hover:bg-primary/90 h-12 rounded-xl"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Restored File
                          </Button>
                          <Button
                            variant="outline"
                            onClick={resetDecrypt}
                            className="flex-1 bg-card border-border h-12 rounded-xl"
                          >
                            Decrypt Another
                          </Button>
                        </div>
                      </div>
                    )}

                    {decError && (
                      <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 border border-destructive/20 rounded-xl">
                        <ShieldAlert className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{decError}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-card/30 border border-border p-5 rounded-2xl space-y-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <h4 className="font-bold text-sm text-foreground">Zero Server Interaction</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Encryption happens inside the browser. Not a single byte of your file or password ever travels to our server.
                </p>
              </div>
              <div className="bg-card/30 border border-border p-5 rounded-2xl space-y-2">
                <Key className="w-6 h-6 text-primary" />
                <h4 className="font-bold text-sm text-foreground">PBKDF2 Key Derivation</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Converts passwords to 256-bit keys using standard hashing algorithms. Resistant to brute force attacks.
                </p>
              </div>
              <div className="bg-card/30 border border-border p-5 rounded-2xl space-y-2">
                <Zap className="w-6 h-6 text-primary" />
                <h4 className="font-bold text-sm text-foreground">AES-256 GCM Standard</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Industry standard symmetric encryption ensuring that data remains confidential and tampering is detected instantly.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FileEncryptPage;
