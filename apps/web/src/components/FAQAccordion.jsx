import React, { useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { getFAQPageSchema } from '@/lib/seo-helper';

export const FAQAccordion = ({ faqs = [] }) => {
  useEffect(() => {
    if (faqs.length === 0) return;

    const schema = getFAQPageSchema(faqs);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-jsonld-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('faq-jsonld-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [faqs]);

  if (faqs.length === 0) return null;

  return (
    <div className="mt-16 border-t border-border pt-12 max-w-3xl mx-auto w-full">
      <h3 className="text-2xl font-bold text-foreground text-center mb-8">
        Frequently Asked Questions
      </h3>
      <Accordion type="single" collapsible className="w-full space-y-1">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-border/60 px-4 rounded-2xl hover:bg-muted/10 transition-all duration-200">
            <AccordionTrigger className="text-base font-semibold text-foreground hover:text-primary transition-colors py-4 no-underline hover:no-underline text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
export default FAQAccordion;
