import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2, Copy, Check, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { BLOG_POSTS } from '@/constants/blog-posts';

export const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  // Find the current blog post
  const post = BLOG_POSTS.find(p => p.slug === slug);

  // Reading progress bar setup
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!post) {
    return (
      <>
        <Helmet>
          <title>Article Not Found - CompressBit</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
          <Header />
          <main className="flex-grow pt-40 pb-20 px-4 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-extrabold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              The resource article you are looking for might have been moved, deleted, or does not exist.
            </p>
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Find other posts for recommendations (excluding current)
  const recommendations = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{post.title} | CompressBit</title>
        <meta name="description" content={post.excerpt} />
        
        {/* Open Graph / Social Sharing Tags */}
        <meta property="og:title" content={`${post.title} - CompressBit`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.compressbit.com/blog/${post.slug}`} />
        <meta property="og:image" content="https://www.compressbit.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} - CompressBit`} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content="https://www.compressbit.com/og-image.png" />
      </Helmet>

      {/* Reading Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50" 
        style={{ scaleX }} 
      />

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />

        <main className="flex-grow pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            {/* Back to Blog Navigation */}
            <div className="mb-8">
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Blog
              </Link>
            </div>

            {/* Article Container */}
            <article className="relative bg-card/40 border border-border/80 rounded-3xl p-6 md:p-12 shadow-xl shadow-primary/2">
              
              {/* Meta Tags / Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-none font-semibold text-xs py-1 px-3">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
                {post.title}
              </h1>

              {/* Author & Info Bar */}
              <div className="flex flex-wrap items-center justify-between border-y border-border/50 py-4 mb-8 text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-border" />
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Post HTML Body Content */}
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed text-base md:text-lg space-y-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

            </article>

            {/* Read More Recommendations */}
            <div className="mt-16 border-t border-border pt-12">
              <h3 className="text-2xl font-bold mb-8">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map(rec => (
                  <Link key={rec.slug} to={`/blog/${rec.slug}`} className="group">
                    <Card className="p-6 h-full flex flex-col justify-between bg-card border-border hover:border-primary/50 transition-all duration-300">
                      <div className="space-y-3">
                        <div className="flex gap-1.5">
                          {rec.tags.slice(0, 2).map(t => (
                            <Badge key={t} variant="secondary" className="bg-muted text-muted-foreground border-none font-semibold text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <h4 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {rec.excerpt}
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                        <span>{rec.date}</span>
                        <span className="text-primary flex items-center gap-1">
                          Read Post <ArrowLeft className="w-3 h-3 rotate-180" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPostPage;
