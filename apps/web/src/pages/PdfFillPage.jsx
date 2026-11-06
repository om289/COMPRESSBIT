import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { CheckSquare, Download, FilePenLine, Loader2, Upload } from 'lucide-react';
import { PDFDocument, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup, PDFTextField } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const inputForField = (field) => {
  const name = field.getName();
  if (field instanceof PDFTextField) return { name, type: 'text', value: field.getText() || '' };
  if (field instanceof PDFCheckBox) return { name, type: 'checkbox', value: field.isChecked() };
  if (field instanceof PDFDropdown || field instanceof PDFOptionList) return { name, type: 'select', value: field.getSelected()[0] || '', options: field.getOptions() };
  if (field instanceof PDFRadioGroup) return { name, type: 'select', value: field.getSelected() || '', options: field.getOptions() };
  return null;
};

const PdfFillPage = () => {
  const [file, setFile] = useState(null);
  const [fields, setFields] = useState([]);
  const [flatten, setFlatten] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const loadFile = async (candidate) => {
    if (!candidate) return;
    if (candidate.type !== 'application/pdf' && !candidate.name.toLowerCase().endsWith('.pdf')) return toast.error('Choose a PDF file.');
    try {
      const pdf = await PDFDocument.load(await candidate.arrayBuffer(), { ignoreEncryption: true });
      const formFields = pdf.getForm().getFields().map(inputForField).filter(Boolean);
      setFile(candidate);
      setFields(formFields);
      if (!formFields.length) toast.info('No standard fillable fields were found in this PDF.');
    } catch {
      toast.error('This PDF could not be opened for form editing.');
    }
  };

  const updateField = (name, value) => setFields((current) => current.map((field) => field.name === name ? { ...field, value } : field));

  const savePdf = async () => {
    if (!file || !fields.length) return;
    setSaving(true);
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const form = pdf.getForm();
      fields.forEach((entry) => {
        const field = form.getField(entry.name);
        if (field instanceof PDFTextField) field.setText(String(entry.value || ''));
        if (field instanceof PDFCheckBox) entry.value ? field.check() : field.uncheck();
        if (field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) {
          if (entry.value) field.select(entry.value);
        }
      });
      if (flatten) form.flatten();
      const blob = new Blob([await pdf.save()], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace(/\.pdf$/i, '')}-filled.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Filled PDF downloaded');
    } catch (error) {
      toast.error(error.message || 'Could not save this PDF form.');
    } finally {
      setSaving(false);
    }
  };

  return <><Helmet><title>Fill PDF Forms Locally | CompressBit</title><meta name="description" content="Fill compatible PDF form fields privately in your browser and download the completed document." /></Helmet><div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0"><Header /><main className="flex-grow pt-28 pb-16"><div className="max-w-3xl mx-auto px-4 space-y-8"><div className="text-center space-y-3"><div className="inline-flex gap-2 items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"><FilePenLine className="w-3.5 h-3.5" /> PDF form editor</div><h1 className="text-4xl font-extrabold">Fill PDF Forms</h1><p className="text-muted-foreground">Edit standard PDF form fields locally, then download the completed file.</p></div><Card className="p-6 rounded-2xl space-y-5"><label className="block border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer"><Upload className="w-8 h-8 text-primary mx-auto mb-3" /><span className="font-semibold">{file ? file.name : 'Choose a fillable PDF'}</span><input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(event) => loadFile(event.target.files?.[0])} /></label>{file && !fields.length && <p className="text-sm text-muted-foreground text-center">No compatible fields were detected. This tool supports ordinary AcroForm fields, not scanned documents.</p>}{fields.map((field) => <div key={field.name} className="space-y-1.5"><label className="text-sm font-semibold text-foreground">{field.name}</label>{field.type === 'checkbox' ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.value} onChange={(event) => updateField(field.name, event.target.checked)} className="accent-primary" />Checked</label> : field.type === 'select' ? <select value={field.value} onChange={(event) => updateField(field.name, event.target.value)} className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm"><option value="">Select…</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input value={field.value} onChange={(event) => updateField(field.name, event.target.value)} className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm" />}</div>)}{fields.length > 0 && <><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={flatten} onChange={(event) => setFlatten(event.target.checked)} className="accent-primary" />Flatten fields after saving (make values non-editable)</label><Button onClick={savePdf} disabled={saving} className="w-full h-12">{saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><Download className="w-4 h-4 mr-2" />Download completed PDF</>}</Button></>}</Card></div></main><Footer /></div></>;
};

export default PdfFillPage;
