/**
 * Generates Structured Schema (JSON-LD) for tool pages.
 * 
 * @param {string} toolName - Name of the tool (e.g. "PDF Compressor")
 * @param {string} path - URL path (e.g. "/pdf")
 * @param {string} description - Meta description of the tool
 * @returns {object} WebApplication JSON-LD schema
 */
export function getWebApplicationSchema(toolName, path, description) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `CompressBit - ${toolName}`,
    "url": `https://www.compressbit.com${path}`,
    "description": description,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires standard modern browser supporting HTML5 and JavaScript.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    }
  };
}

/**
 * Generates Structured Schema (JSON-LD) for FAQ pages.
 * 
 * @param {Array<{question: string, answer: string}>} faqs - Questions and answers
 * @returns {object} FAQPage JSON-LD schema
 */
export function getFAQPageSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
