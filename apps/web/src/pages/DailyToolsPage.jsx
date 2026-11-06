import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Barcode, Copy, Download, FileKey, FileText, Fingerprint, KeyRound, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const copyText = async (value, label) => {
  await navigator.clipboard.writeText(value);
  toast.success(`${label} copied`);
};

const randomPassword = (length, options) => {
  const sets = [
    options.lowercase && 'abcdefghijkmnopqrstuvwxyz',
    options.uppercase && 'ABCDEFGHJKLMNPQRSTUVWXYZ',
    options.numbers && '23456789',
    options.symbols && '!@#$%^&*_-+=?',
  ].filter(Boolean);
  const alphabet = sets.join('');
  if (!alphabet) return '';
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
};

const DailyToolsPage = () => {
  const [qrText, setQrText] = useState('https://www.compressbit.com');
  const [qrUrl, setQrUrl] = useState('');
  const [barcodeText, setBarcodeText] = useState('COMPRESSBIT-2026');
  const [barcodeError, setBarcodeError] = useState('');
  const barcodeRef = useRef(null);
  const [passwordOptions, setPasswordOptions] = useState({ lowercase: true, uppercase: true, numbers: true, symbols: true });
  const [passwordLength, setPasswordLength] = useState(16);
  const [password, setPassword] = useState('');
  const [uuid, setUuid] = useState('');
  const [hash, setHash] = useState('');
  const [hashName, setHashName] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [timestamp, setTimestamp] = useState(String(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    setPassword(randomPassword(16, { lowercase: true, uppercase: true, numbers: true, symbols: true }));
    setUuid(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!qrText.trim()) {
      setQrUrl('');
      return;
    }
    QRCode.toDataURL(qrText.trim(), { width: 512, margin: 2, color: { dark: '#111827', light: '#ffffff' } })
      .then(setQrUrl)
      .catch(() => setQrUrl(''));
  }, [qrText]);

  useEffect(() => {
    if (!barcodeRef.current || !barcodeText.trim()) return;
    try {
      JsBarcode(barcodeRef.current, barcodeText.trim(), { format: 'CODE128', lineColor: '#111827', width: 2, height: 96, displayValue: true, margin: 12 });
      setBarcodeError('');
    } catch (error) {
      setBarcodeError('Use plain letters, numbers, and common punctuation for this barcode.');
    }
  }, [barcodeText]);

  const generatePassword = () => {
    const next = randomPassword(passwordLength, passwordOptions);
    if (!next) {
      toast.error('Select at least one character group.');
      return;
    }
    setPassword(next);
  };

  const hashFile = async (file) => {
    if (!file) return;
    setIsHashing(true);
    setHash('');
    setHashName(file.name);
    try {
      const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      setHash(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''));
      toast.success('SHA-256 hash calculated locally');
    } catch {
      toast.error('Could not calculate the file hash.');
    } finally {
      setIsHashing(false);
    }
  };

  const downloadDataUrl = (url, name) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  const transformText = (action) => {
    try {
      const value = textInput;
      const transforms = {
        upper: () => value.toUpperCase(),
        lower: () => value.toLowerCase(),
        title: () => value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
        trim: () => value.split('\n').map((line) => line.trim()).join('\n'),
        dedupe: () => [...new Set(value.split('\n').map((line) => line.trim()).filter(Boolean))].join('\n'),
        jsonFormat: () => JSON.stringify(JSON.parse(value), null, 2),
        jsonMinify: () => JSON.stringify(JSON.parse(value)),
        base64Encode: () => btoa(unescape(encodeURIComponent(value))),
        base64Decode: () => decodeURIComponent(escape(atob(value))),
        urlEncode: () => encodeURIComponent(value),
        urlDecode: () => decodeURIComponent(value),
      };
      setTextInput(transforms[action]());
    } catch {
      toast.error('That input cannot be transformed with this action.');
    }
  };

  const timestampDate = Number(timestamp) > 100000000000 ? new Date(Number(timestamp)) : new Date(Number(timestamp) * 1000);
  const wordCount = textInput.trim() ? textInput.trim().split(/\s+/).length : 0;

  return (
    <>
      <Helmet>
        <title>Daily Tools - QR, Barcode, Password & File Hash | CompressBit</title>
        <meta name="description" content="Generate QR codes, barcodes, strong passwords, UUIDs, and SHA-256 file hashes locally in your browser." />
      </Helmet>
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />
        <main className="flex-grow pt-28 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> Local daily utilities</div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Daily Tools</h1>
              <p className="text-muted-foreground">Quick utilities for everyday sharing, labels, passwords, and file verification. Everything runs in your browser.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4 bg-card border-border rounded-2xl">
                <div className="flex items-center gap-2"><QrCode className="w-5 h-5 text-primary" /><h2 className="font-bold text-lg">QR code generator</h2></div>
                <textarea value={qrText} onChange={(event) => setQrText(event.target.value)} maxLength="2000" className="w-full min-h-24 p-3 rounded-xl bg-background border border-border text-sm" placeholder="Link, text, contact details, or Wi-Fi text" />
                {qrUrl && <div className="bg-white rounded-xl p-4 flex justify-center"><img src={qrUrl} alt="Generated QR code" className="w-48 h-48" /></div>}
                <Button onClick={() => downloadDataUrl(qrUrl, 'compressbit-qr-code.png')} disabled={!qrUrl} className="w-full"><Download className="w-4 h-4 mr-2" />Download QR code</Button>
              </Card>

              <Card className="p-6 space-y-4 bg-card border-border rounded-2xl">
                <div className="flex items-center gap-2"><Barcode className="w-5 h-5 text-primary" /><h2 className="font-bold text-lg">Barcode generator</h2></div>
                <input value={barcodeText} onChange={(event) => setBarcodeText(event.target.value)} maxLength="80" className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm" placeholder="Product or inventory code" />
                <div className="bg-white rounded-xl p-4 overflow-auto"><svg ref={barcodeRef} className="min-w-[260px]" /></div>
                {barcodeError && <p className="text-xs text-destructive">{barcodeError}</p>}
                <Button onClick={() => downloadDataUrl(barcodeRef.current?.toDataURL?.('image/png'), 'compressbit-barcode.png')} className="w-full"><Download className="w-4 h-4 mr-2" />Download barcode</Button>
              </Card>

              <Card className="p-6 space-y-4 bg-card border-border rounded-2xl">
                <div className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /><h2 className="font-bold text-lg">Password & UUID generator</h2></div>
                <div className="flex items-center gap-3"><input type="range" min="8" max="64" value={passwordLength} onChange={(event) => setPasswordLength(Number(event.target.value))} className="flex-1 accent-primary" /><span className="text-sm font-bold w-10">{passwordLength}</span></div>
                <div className="grid grid-cols-2 gap-2 text-sm">{Object.entries(passwordOptions).map(([key, checked]) => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={checked} onChange={(event) => setPasswordOptions((current) => ({ ...current, [key]: event.target.checked }))} className="accent-primary" />{key}</label>)}</div>
                <div className="flex gap-2"><input readOnly value={password} className="flex-1 h-11 px-3 rounded-xl bg-background border border-border text-sm font-mono" /><Button variant="outline" size="icon" onClick={() => copyText(password, 'Password')}><Copy className="w-4 h-4" /></Button></div>
                <Button variant="outline" onClick={generatePassword} className="w-full"><RefreshCw className="w-4 h-4 mr-2" />Generate password</Button>
                <div className="flex gap-2"><input readOnly value={uuid} className="flex-1 h-11 px-3 rounded-xl bg-background border border-border text-xs font-mono" /><Button variant="outline" size="icon" onClick={() => copyText(uuid, 'UUID')}><Copy className="w-4 h-4" /></Button></div>
                <Button variant="outline" onClick={() => setUuid(crypto.randomUUID())} className="w-full"><RefreshCw className="w-4 h-4 mr-2" />Generate UUID</Button>
              </Card>

              <Card className="p-6 space-y-4 bg-card border-border rounded-2xl">
                <div className="flex items-center gap-2"><Fingerprint className="w-5 h-5 text-primary" /><h2 className="font-bold text-lg">SHA-256 file hash</h2></div>
                <label className="block border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors"><FileKey className="w-7 h-7 text-primary mx-auto mb-2" /><span className="text-sm font-semibold">Choose any file to verify</span><input type="file" className="hidden" onChange={(event) => hashFile(event.target.files?.[0])} /></label>
                {isHashing && <p className="text-sm text-muted-foreground">Calculating locally…</p>}
                {hash && <div className="space-y-2"><p className="text-xs text-muted-foreground truncate">{hashName}</p><div className="flex gap-2"><textarea readOnly value={hash} className="flex-1 min-h-20 p-3 rounded-xl bg-background border border-border font-mono text-xs" /><Button variant="outline" size="icon" onClick={() => copyText(hash, 'SHA-256 hash')}><Copy className="w-4 h-4" /></Button></div></div>}
              </Card>
            </div>

            <Card className="p-6 space-y-5 bg-card border-border rounded-2xl">
              <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /><h2 className="font-bold text-lg">Text, JSON & link tools</h2></div>
              <textarea value={textInput} onChange={(event) => setTextInput(event.target.value)} placeholder="Paste text, JSON, Base64, a URL, or one item per line…" className="w-full min-h-44 p-4 rounded-xl bg-background border border-border text-sm font-mono" />
              <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-muted px-3 py-1">{textInput.length} characters</span><span className="rounded-full bg-muted px-3 py-1">{wordCount} words</span><span className="rounded-full bg-muted px-3 py-1">{textInput ? textInput.split('\n').length : 0} lines</span></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('upper')}>UPPERCASE</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('lower')}>lowercase</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('title')}>Title Case</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('trim')}>Trim lines</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('dedupe')}>Unique lines</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => copyText(textInput, 'Text')}>Copy text</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('jsonFormat')}>Format JSON</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('jsonMinify')}>Minify JSON</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('base64Encode')}>Base64 encode</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('base64Decode')}>Base64 decode</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('urlEncode')}>URL encode</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => transformText('urlDecode')}>URL decode</Button>
              </div>
            </Card>

            <Card className="p-6 space-y-4 bg-card border-border rounded-2xl">
              <div className="flex items-center gap-2"><FileKey className="w-5 h-5 text-primary" /><h2 className="font-bold text-lg">Unix timestamp converter</h2></div>
              <div className="flex flex-col sm:flex-row gap-3"><input value={timestamp} onChange={(event) => setTimestamp(event.target.value)} inputMode="numeric" className="flex-1 h-11 px-3 rounded-xl bg-background border border-border text-sm font-mono" placeholder="Unix timestamp in seconds or milliseconds" /><Button type="button" variant="outline" onClick={() => setTimestamp(String(Math.floor(Date.now() / 1000)))}>Use current time</Button></div>
              <p className="text-sm text-muted-foreground">{Number.isNaN(timestampDate.getTime()) ? 'Enter a valid Unix timestamp.' : timestampDate.toLocaleString()} <span className="text-xs">({Number.isNaN(timestampDate.getTime()) ? '' : timestampDate.toISOString()})</span></p>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default DailyToolsPage;
