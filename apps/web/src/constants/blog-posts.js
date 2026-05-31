export const BLOG_POSTS = [
  {
    slug: 'why-local-file-compression-is-safer-than-cloud',
    title: 'Why Local File Compression is Safer Than Cloud Services',
    excerpt: 'Uploading sensitive business files or private photos to external cloud compressors poses a serious security risk. Learn how modern browser-based engines provide 100% security.',
    date: 'May 28, 2026',
    readTime: '5 min read',
    tags: ['Security', 'Privacy', 'WebAssembly'],
    content: `
      <p class="leading-relaxed mb-4 text-muted-foreground">Every day, millions of users upload PDFs, Excel sheets, and personal photos to free cloud compression websites. While these tools are convenient, they present a hidden and severe threat: your private data leaves your device and lands on an unknown external server.</p>
      
      <h3 class="text-xl font-bold text-foreground mt-8 mb-4">The Hidden Risks of Cloud Compression</h3>
      <p class="leading-relaxed mb-4 text-muted-foreground">When you click "Upload" on a standard cloud compressor, your file is sent over the network to the provider's server. Once there, you lose control over what happens to it. Many free services fund their operations by collecting metadata, storing logs, or, in worst-case scenarios, keeping copies of your documents on vulnerable caches. If the provider suffers a data breach, your files—containing invoices, legal contracts, or identity proofs—could be exposed to the public.</p>
      
      <h3 class="text-xl font-bold text-foreground mt-8 mb-4">The Solution: Client-Side Browser Processing</h3>
      <p class="leading-relaxed mb-4 text-muted-foreground">Modern web technology has advanced to the point where remote servers are no longer necessary for file optimization. Thanks to technologies like <strong>WebAssembly (WASM)</strong> and HTML5 APIs, your browser can run complex algorithms locally on your machine.</p>
      
      <p class="leading-relaxed mb-4 text-muted-foreground">By keeping operations strictly client-side, tools like CompressBit ensure that:</p>
      <ul class="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
        <li><strong>No Network Transfers:</strong> Your raw file bytes are read directly from your memory drive and processed in RAM. Not a single packet of file content is sent over the Internet.</li>
        <li><strong>Guaranteed Erasure:</strong> Once you close the browser tab, the memory space is cleared by the browser. There are no databases or server backups holding your sensitive files.</li>
        <li><strong>Offline Utility:</strong> Since the code runs on your hardware, you can compress files even when you have no internet access.</li>
      </ul>
      
      <h3 class="text-xl font-bold text-foreground mt-8 mb-4">Protecting Your Digital Assets</h3>
      <p class="leading-relaxed mb-4 text-muted-foreground">In a world where data leaks are increasingly common, protecting your digital assets is crucial. When optimizing documents containing personal identification, financial numbers, or intellectual property, always opt for client-side local tools. Security should never be sacrificed for speed, and with modern browser engines, you can have both.</p>
    `
  },
  {
    slug: 'understanding-pdf-compression-lossy-vs-lossless',
    title: 'Understanding PDF Compression: Lossy vs. Lossless',
    excerpt: 'Not all compression is created equal. Dive deep into the technical differences between lossy rasterization and lossless structural compression to find the perfect setting for your files.',
    date: 'May 20, 2026',
    readTime: '6 min read',
    tags: ['PDF Theory', 'Optimization', 'Guides'],
    content: `
      <p class="leading-relaxed mb-4 text-muted-foreground">PDFs are the universal standard for sharing documents, but their file sizes can quickly balloon due to high-resolution images, font subsets, and complex vector elements. To shrink them, we use PDF compression, which falls into two distinct methodologies: Lossy and Lossless. Let's break down how they work.</p>
      
      <h3 class="text-xl font-bold text-foreground mt-8 mb-4">1. Lossless PDF Compression</h3>
      <p class="leading-relaxed mb-4 text-muted-foreground">Lossless compression reduces file size without removing any underlying data or altering document visual quality. It achieves this by finding and eliminating redundancy within the document code.</p>
      <ul class="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
        <li><strong>Flate Compression:</strong> Compresses text streams, vector paths, and page layout instructions using the Deflate algorithm (similar to ZIP).</li>
        <li><strong>Font Subsetting:</strong> Strips out unused characters from embedded font files, leaving only the exact characters needed to render the document.</li>
        <li><strong>Metadata Cleaning:</strong> Deletes duplicate metadata records, thumbnail previews, and XML schemas that add useless bytes.</li>
      </ul>
      <p class="leading-relaxed mb-4 text-muted-foreground"><em>Best for:</em> Official legal briefs, text-heavy spreadsheets, and books where vector diagrams must remain perfectly sharp at any zoom level.</p>
      
      <h3 class="text-xl font-bold text-foreground mt-8 mb-4">2. Lossy PDF Compression</h3>
      <p class="leading-relaxed mb-4 text-muted-foreground">Lossy compression achieves much higher reduction rates by permanently discarding less critical visual data, primarily targeting embedded images. It does this through two main processes:</p>
      <ul class="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
        <li><strong>Downsampling:</strong> Reduces the pixel density (DPI) of images. For example, downsampling a 600 DPI scan to 150 DPI significantly reduces pixel count while remaining clear on standard screens.</li>
        <li><strong>JPEG Compression:</strong> Applies mathematical transformations to compress image elements, introducing minor artifacts that are barely noticeable to the human eye.</li>
      </ul>
      <p class="leading-relaxed mb-4 text-muted-foreground"><em>Best for:</em> Scanned invoices, presentation slides, newsletters, and portfolios where file size is critical for email attachments.</p>
      
      <h3 class="text-xl font-bold text-foreground mt-8 mb-4">Which Setting is Right for You?</h3>
      <p class="leading-relaxed mb-4 text-muted-foreground">For simple text forms and official filings, stick to lossless settings (like CompressBit's <em>Good</em> preset). If you have scanned pages or documents containing heavy photography, use a lossy setting (like our <em>Extreme</em> preset) to achieve the smallest possible file footprint.</p>
    `
  },
  {
    slug: 'guide-to-secure-browser-based-file-encryption',
    title: 'A Guide to Secure Browser-Based File Encryption',
    excerpt: 'How does the Web Crypto API turn your passwords into military-grade AES-256 keys right inside your tab? Explore the mechanics of local cryptographic structures.',
    date: 'May 15, 2026',
    readTime: '7 min read',
    tags: ['Cryptography', 'Security', 'Tech Explainer'],
    content: `
      <p class="leading-relaxed mb-4 text-muted-foreground">When sharing sensitive files, simply compressing them isn't enough—you need to secure them. Secure file encryption used to require dedicated desktop software. Today, the browser's native <strong>Web Crypto API</strong> allows us to encrypt files with military-grade algorithms locally, without installing anything.</p>
      
      <h3 class="text-xl font-bold text-foreground mt-8 mb-4">The Algorithm: AES-256-GCM</h3>
      <p class="leading-relaxed mb-4 text-muted-foreground">At the core of secure client-side encryption is the <strong>Advanced Encryption Standard (AES)</strong> with a 256-bit key length, running in <strong>Galois/Counter Mode (GCM)</strong>.</p>
      <ul class="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
        <li><strong>AES-256:</strong> Supported by governments and banking institutions worldwide, a 256-bit key has $2^{256}$ possible combinations, making brute-force decryption mathematically impossible with current technology.</li>
        <li><strong>GCM (Galois/Counter Mode):</strong> This is an authenticated encryption mode. It not only keeps the file content secret, but also attaches a cryptographic tag that guarantees the file hasn't been modified or tampered with since it was encrypted.</li>
      </ul>
      
      <h3 class="text-xl font-bold text-foreground mt-8 mb-4">Password Derivation: The PBKDF2 Standard</h3>
      <p class="leading-relaxed mb-4 text-muted-foreground">A common mistake is using a user's password directly as the encryption key. Passwords are often short and predictable. To secure them, the Web Crypto API uses <strong>PBKDF2</strong> (Password-Based Key Derivation Function 2):</p>
      <ol class="list-decimal list-inside space-y-2 mb-6 text-muted-foreground">
        <li><strong>Adding Salt:</strong> A random 16-byte value (the "salt") is mixed with your password. This prevents attackers from using pre-computed tables (rainbow tables) to crack your password.</li>
        <li><strong>Stretching:</strong> The salt and password are run through a hashing function (like SHA-256) repeatedly—typically 100,000+ times. This makes checking a single password guess computationally expensive, slowing down automated cracking tools.</li>
      </ol>
      
      <h3 class="text-xl font-bold text-foreground mt-8 mb-4">How It Works in Your Browser</h3>
      <p class="leading-relaxed mb-4 text-muted-foreground">When you secure a file with CompressBit's File Encryptor:</p>
      <ol class="list-decimal list-inside space-y-2 mb-6 text-muted-foreground">
        <li>The browser generates a random salt and initialization vector (IV).</li>
        <li>PBKDF2 stretches your password and salt into a 256-bit AES key.</li>
        <li>The Web Crypto API encrypts the file byte array into a cipher block.</li>
        <li>The salt, IV, and cipher block are joined together and saved as a downloadable <code>.enc</code> file.</li>
      </ol>
      <p class="leading-relaxed mb-4 text-muted-foreground">Because all these mathematical calculations are executed by the browser's cryptographic module, your password and key never leave your computer's RAM. Your data remains fully secure, private, and under your control.</p>
    `
  }
];
