import React from 'react';
import { FileText, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Blog & Resources', path: '/blog' }
  ];

  const toolLinks = [
    { name: 'PDF Compressor', path: '/pdf' },
    { name: 'PDF Merger', path: '/pdf/merge' },
    { name: 'PDF Splitter', path: '/pdf/split' },
    { name: 'PDF to Image', path: '/pdf/to-image' },
    { name: 'Protect PDF', path: '/pdf/protect' },
    { name: 'Image Compressor', path: '/image' },
    { name: 'Image to PDF', path: '/image/to-pdf' },
    { name: 'Convert Image', path: '/image/convert' },
    { name: 'File Encryptor', path: '/encrypt' }
  ];

  return (
    <footer id="footer" className="bg-secondary text-secondary-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CompressBit</span>
            </Link>
            <p className="text-sm text-secondary-foreground/80 leading-relaxed">
              Compress, merge, and encrypt files entirely in your browser. Fast, secure, and completely private — no server uploads.
            </p>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <span className="text-sm font-semibold tracking-wide">Tools</span>
            <ul className="space-y-2">
              {toolLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Connect */}
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="text-sm font-semibold tracking-wide">Legal</span>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-semibold tracking-wide">Open Source</span>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/om289/COMPRESSBIT"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center hover:bg-background transition-all duration-200 hover:scale-105"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-center text-secondary-foreground/70">
            © {currentYear} CompressBit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;