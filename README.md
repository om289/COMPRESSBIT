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

### 2. The Universal Image Engine (`/png`, `/jpg`)
The image engine dynamically adapts to JPG, PNG, and WebP inputs, standardizing and crushing them to save bandwidth.

*   **Step 1. Blob to Canvas**: The raw file blob is streamed into an `Image()` object and painted onto a 2D canvas structure.
*   **Step 2. Contextual Resizing**: Depending on the tier selected, the engine checks the original bounding box. If the image is incredibly large (e.g., 4K resolution), it mathematically calculates a proportional down-scaling limit (e.g., locking it to a max of 1280px wide).
*   **Step 3. Format Normalization**: Transparent PNGs are given a solid white background and converted to mathematically tighter JPGs under Extreme compression to maximize space saving.

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
*   **SEO Optmized**: Implements `react-helmet` to switch out head tags per route. Bundled with a custom `sitemap.xml` mapping `/`, `/pdf`, `/png`, and `/jpg` for deep indexing.

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
