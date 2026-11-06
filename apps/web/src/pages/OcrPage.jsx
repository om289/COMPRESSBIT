import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Download, FileSearch, FileText, Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const OcrPage = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  const chooseFile = async (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/') && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Choose an image or PDF file.');
      return;
    }
    setFile(selectedFile);
    setText('');
    setPageNumber(1);
    if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
      try {
        const pdf = await pdfjsLib.getDocument({ data: await selectedFile.arrayBuffer() }).promise;
        setPageCount(pdf.numPages);
      } catch {
        toast.error('Could not read this PDF.');
      }
    } else {
      setPageCount(1);
    }
  };

  const runOcr = async () => {
    if (!file) return;
    setProcessing(true);
    setText('');
    try {
      let source = file;
      let canvas;
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setStatus(`Rendering page ${pageNumber} of ${pageCount}…`);
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport, background: 'white' }).promise;
        source = canvas;
      }
      setStatus('Loading local OCR engine…');
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, { logger: (message) => message.status && setStatus(`${message.status} ${Math.round((message.progress || 0) * 100)}%`) });
      const result = await worker.recognize(source);
      await worker.terminate();
      canvas?.remove();
      setText(result.data.text.trim());
      setStatus('Text extracted locally.');
      toast.success('OCR complete');
    } catch (error) {
      setStatus('');
      toast.error(error.message || 'OCR could not read this file.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.replace(/\.[^.]+$/, '') || 'ocr'}-text.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <>
    <Helmet><title>OCR Image & PDF to Text | CompressBit</title><meta name="description" content="Extract text from scanned images and PDFs in your browser using local OCR." /></Helmet>
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0"><Header />
      <main className="flex-grow pt-28 pb-16"><div className="max-w-3xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"><FileSearch className="w-3.5 h-3.5" /> Browser OCR</div><h1 className="text-4xl font-extrabold">Scan to Text</h1><p className="text-muted-foreground">Extract selectable text from an image or a chosen PDF page. The recognition runs in your browser.</p></div>
        <Card className="p-6 space-y-5 rounded-2xl">
          <label className="block border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer"><Upload className="w-8 h-8 text-primary mx-auto mb-3" /><span className="font-semibold">{file ? file.name : 'Choose image or PDF'}</span><input type="file" accept="image/*,application/pdf" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} /></label>
          {file && <>
            {pageCount > 1 && <label className="block text-sm font-medium">PDF page to read <input type="number" min="1" max={pageCount} value={pageNumber} onChange={(event) => setPageNumber(Math.min(pageCount, Math.max(1, Number(event.target.value) || 1)))} className="ml-3 w-20 h-9 px-2 rounded-lg bg-background border border-border" /> <span className="text-muted-foreground">of {pageCount}</span></label>}
            <Button onClick={runOcr} disabled={processing} className="w-full h-12">{processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{status || 'Reading…'}</> : <><ImageIcon className="w-4 h-4 mr-2" />Extract text</>}</Button>
          </>}
        </Card>
        {text && <Card className="p-6 space-y-3 rounded-2xl"><div className="flex justify-between gap-4 items-center"><h2 className="font-bold">Extracted text</h2><Button variant="outline" size="sm" onClick={downloadText}><Download className="w-4 h-4 mr-2" />Download .txt</Button></div><textarea readOnly value={text} className="w-full min-h-72 p-4 rounded-xl bg-background border border-border text-sm leading-relaxed" /></Card>}
      </div></main><Footer />
    </div>
  </>;
};

export default OcrPage;
