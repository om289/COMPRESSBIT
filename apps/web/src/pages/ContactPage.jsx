import React from 'react';
import { Helmet } from 'react-helmet';
import { MessageCircle, Bug, Lightbulb, ShieldQuestion, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const issueUrl = 'https://github.com/om289/COMPRESSBIT/issues';

const ContactPage = () => (
  <>
    <Helmet>
      <title>Contact & Support | CompressBit</title>
      <meta name="description" content="Get help with CompressBit tools, report a problem, or share a feature idea through our public support channel." />
      <link rel="canonical" href="https://www.compressbit.com/contact" />
    </Helmet>
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
      <Header />
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <div className="inline-flex w-16 h-16 items-center justify-center rounded-2xl bg-primary/10"><MessageCircle className="w-8 h-8 text-primary" /></div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Contact & Support</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">Need help with a CompressBit tool, want to report a problem, or have an idea? Our public issue tracker is the best way to reach the project.</p>
          </header>
          <Card className="p-7 md:p-10 bg-card border-border max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Bug, title: 'Report a problem', text: 'Tell us the tool, browser, file type, and the steps that led to the issue.' },
                { icon: Lightbulb, title: 'Suggest an improvement', text: 'Share a workflow or format you would like CompressBit to support.' },
                { icon: ShieldQuestion, title: 'Ask about privacy', text: 'Review the Privacy Policy first, then open an issue if anything is unclear.' }
              ].map(({ icon: Icon, title, text }) => <div key={title}><Icon className="w-6 h-6 text-primary mb-3" /><h2 className="font-bold mb-2">{title}</h2><p className="text-sm text-muted-foreground leading-relaxed">{text}</p></div>)}
            </div>
            <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
              Open the CompressBit support tracker <ExternalLink className="w-4 h-4" />
            </a>
            <p className="mt-6 text-xs text-muted-foreground leading-relaxed">Please do not attach confidential documents, passwords, or personal information to a public issue. For questions about how the site handles data, see the Privacy Policy.</p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  </>
);

export default ContactPage;
