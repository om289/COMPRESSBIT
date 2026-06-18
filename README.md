# 🚀 CompressBit
**The Professional Client-Side File Optimization Platform**

CompressBit is a privacy-first, multi-tool platform built to solve a critical issue with online file compressors: **trust**. Instead of uploading sensitive documents, confidential PDFs, or personal photos to remote cloud servers, CompressBit brings the processing engine directly to the user's browser. 

Using advanced Javascript, Web Workers, and the HTML5 Canvas API, files are optimized instantly, securely, and completely offline once the page loads.

---

## 🛡️ The Privacy Promise

The core philosophy of CompressBit is "Zero Uploads." 
No data is ever sent via POST requests to remote servers. No file is temporarily saved in a cloud bucket. Everything happens locally in the browser memory, making it the perfect tool for enterprises, medical professionals, and privacy-conscious users.

---

## 🛠️ Core Engines & Architecture 

CompressBit operates via a React-based frontend monorepo architecture, with discrete engines built to handle specific file formats.

### 1. The PDF Engine (`/pdf`)
Most client-side PDF compressors only strip metadata, which results in a meager 5-10% size reduction. CompressBit uses a complex **Rasterize & Rebuild** pipeline to achieve massive 50-70% file size reductions.

*   **Step 1. Web Worker Parsing**: The engine uses `pdfjs-dist` to parse the PDF structure inside a dedicated Web Worker, ensuring the main UI thread (and animations) never freeze, even for 100+ page documents.
*   **Step 2. Virtual Canvas Rendering**: Each page of the PDF is mapped and rendered onto an off-screen HTML5 `<canvas>`.
*   **Step 3. Lossy Extraction**: The visual canvas data is extracted directly as a highly compressed JPEG string. Because it relies on visual data, all text is essentially "flattened", making it incredibly hard to reverse-engineer while massively shedding structural bloat.
*   **Step 4. PDF Assembly**: Finally, `jsPDF` is initialized to create a fresh, clean PDF container, placing the optimized JPEG pages exactly onto matching aspect-ratio pages.

### 2. The Universal Image Engine (`/png`, `/jpg`, `/image`, `/images`)
The image engine dynamically adapts to JPG, PNG, and WebP inputs, standardizing and crushing them to save bandwidth.

*   **Step 1. Blob to Canvas**: The raw file blob is streamed into an `Image()` object and painted onto a 2D canvas structure.
*   **Step 2. Contextual Resizing**: Depending on the tier selected, the engine checks the original bounding box. If the image is incredibly large (e.g., 4K resolution), it mathematically calculates a proportional down-scaling limit (e.g., locking it to a max of 1280px wide).
*   **Step 3. Format Normalization**: Transparent PNGs are given a solid white background and converted to mathematically tighter JPGs under Extreme compression to maximize space saving.

### 3. The PDF Merger Engine (`/pdf/merge`)
Combines multiple PDF documents completely client-side with visual drag-and-drop sorting.
*   **Zero-Loss Splicing**: Splicing utilizes `pdf-lib`'s `copyPages()` method. Rather than rendering to a canvas, pages are extracted as vector assets and appended to a new container. This preserves layout crispness, selectable text, and links.
*   **Interactive Sorter**: The UI allows dragging items to define document order before compilation.

### 4. The Cryptography Engine (`/encrypt`)
Secures any file format locally in the browser utilizing the native Web Crypto API.
*   **PBKDF2 Key Derivation**: Derives a cryptographically strong 256-bit key from passwords using a random salt and 100,000 iterations (SHA-256).
*   **AES-256-GCM Encryption**: Encrypts file data and metadata (original name, mime-type, and size) using Galois/Counter Mode for confidentiality and integrity verification. Output is packaged into a download-ready `.enc` container.

---

## ⚙️ Compression Tiers Deep Dive

CompressBit provides users with three explicitly tuned levels of optimization.

### For Images (JPG / PNG):
*   🟢 **Good**: Lossless bounds. `Quality = 0.85`. No resizing. Retains original format types.
*   🟡 **Aggressive**: Lossy. `Quality = 0.65`. Hard bounds at `1920x1920`. The perfect balance for web-ready images.
*   🔴 **Extreme**: Highly Lossy. `Quality = 0.40`. Hard bounds at `1280x1280`. Flattens all transparent PNGs to white-background JPEGs for maximum data shedding.

### For Documents (PDF):
*   🟢 **Good**: Lossless metadata stripping via `pdf-lib`. Removes Title, Author, Subject flags, and embeds Object Streams. Yields ~5-10% savings but keeps text fully selectable.
*   🟡 **Aggressive**: Rasterization pipeline. `Scale = 1.0x`, `JPEG Quality = 0.45`. Flattens text.
*   🔴 **Extreme**: Rasterization pipeline. `Scale = 1.0x`, `JPEG Quality = 0.15`. Crushes white space data drastically.

---

## 🎨 UI/UX Design System

The application relies on a highly dynamic, component-driven UI focused on immediate user feedback.

*   **Dynamic SVG Progress Trackers**: When compressing, users see a circular progress animation mapped exactly to the engine's internal progress state.
*   **Generic `FileUploadZone`**: A highly robust, drag-and-drop React component that parses `fileType` props dynamically. If fed `type="pdf"`, it locks `accept` tags to `.pdf`. If fed `type="image"`, it accepts `.jpg, .png, .webp`. It passes the internal file blobs upward to the routing wrapper for final processing.
*   **Premium Component Library**: Built heavily on Radix UI primitives, stylized by standard Tailwind CSS utility classes, and enhanced by `framer-motion` for buttery smooth layout transitions.
*   **SEO Optimized**: Implements `react-helmet` to switch out head tags per route. Injects structured JSON-LD schemas (`WebApplication` and `FAQPage`) dynamically based on active tool pages. Features interactive, schema-generating FAQ Accordions. Bundled with a custom `sitemap.xml` mapping clean paths including the `/blog` directory and posts for deep search engine indexing.
*   **Client-Side Blog & Resource Engine (`/blog`, `/blog/:slug`)**: Statically loaded, rich SEO articles describing compression theory, secure browser cryptography, and client-side processing advantages. Features tag filtering, visual prose reading progress bar indicators, and copy-link triggers.
*   **Privacy-Focused Event Tracking (`/src/lib/analytics.js`)**: Local client-side tracking module that logs user flows and conversion metrics to the console in development, with built-in toggle placeholders for zero-cookie self-hosted scripts.

---

## 🖥️ Local Installation & Development

CompressBit uses `npm` workspaces. To run it locally:

1. **Install dependencies** across the entire monorepo:
   ```bash
   npm install
   ```
2. **Start the environment** (Spins up Vite Dev Server):
   ```bash
   npm run dev
   ```
3. **Build for Production** (Generates minified, static-ready bundles inside `dist/`):
   ```bash
   npm run build
   ```

*Ensure you use Node.js v18+ for optimal compatibility across build pipelines.*

---

## 🌐 GitHub Pages Clean URL Routing

Because GitHub Pages does not natively support HTML5 `pushState` routing (it serves a 404 for clean paths like `/pdf` or `/encrypt` on reload), CompressBit employs a lightweight redirection mechanism:
1. **Redirection Payload (`404.html`)**: When GitHub Pages detects a missing static path, it serves the custom `404.html` containing a script that wraps the current path into a query parameter (e.g. `/?/encrypt`) and redirects back to `/`.
2. **Resolution (`index.html`)**: A small script inside the `<head>` of the main `index.html` parses this parameter, restores the clean path history via `window.history.replaceState()`, and exposes it back to React Router before the app mounts.

---

## 🗺️ Website Sitemap & Page Index

Below is the directory mapping of active pages on **CompressBit**, as defined in the `sitemap.xml`:

| Path | Description | Priority |
| :--- | :--- | :--- |
| `/` | **Homepage** — Hub for all compression tools. | `1.00` |
| `/pdf` | **PDF Compressor** — Reduce PDF file size offline. | `0.80` |
| `/pdf/merge` | **PDF Merger** — Combine multiple PDFs locally. | `0.80` |
| `/pdf/split` | **PDF Splitter** — Extract pages from a PDF. | `0.80` |
| `/pdf/to-image` | **PDF to Image** — Convert PDF pages into JPG/PNG. | `0.80` |
| `/pdf/protect` | **PDF Password Protect** — Secure PDFs. | `0.80` |
| `/image` | **Image Compressor** — Optimize JPEG, PNG, and WebP images. | `0.80` |
| `/image/to-pdf` | **Image to PDF** — Convert images to a single PDF. | `0.80` |
| `/image/convert` | **Image Format Converter** — Change image extensions. | `0.80` |
| `/encrypt` | **Secure File Encryption** — Client-side AES-256 encryption. | `0.80` |
| `/privacy` | **Privacy Policy** — Our zero-upload security commitment. | `0.30` |
| `/terms` | **Terms of Service** — Terms of use for the platform. | `0.30` |
| `/blog` | **Blog Home** — Articles on compression, cryptography, and optimization. | `0.70` |
| `/blog/why-local-file-compression-is-safer-than-cloud` | **Blog Post** — Why local compression is safer. | `0.60` |
| `/blog/understanding-pdf-compression-lossy-vs-lossless` | **Blog Post** — Lossy vs. Lossless PDF optimization. | `0.60` |
| `/blog/guide-to-secure-browser-based-file-encryption` | **Blog Post** — Guide to browser-based encryption. | `0.60` |


