import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Clock, ArrowRight, Search, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { BLOG_POSTS } from '@/constants/blog-posts';

export const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Extract all unique tags
  const allTags = ['All', ...new Set(BLOG_POSTS.flatMap(post => post.tags))];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <>
      <Helmet>
        <title>Resources & Blog - Client-Side Optimization | CompressBit</title>
        <meta name="description" content="Read expert guides on file compression theory, PDF structure manipulation, client-side browser performance, and secure AES-256 local encryption." />
        
        {/* Open Graph / Social Sharing Tags */}
        <meta property="og:title" content="Resources & Blog - CompressBit" />
        <meta property="og:description" content="Expert guides on local client-side file compression, PDF split/merge workflows, and browser cryptography." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.compressbit.com/blog" />
        <meta property="og:image" content="https://www.compressbit.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resources & Blog - CompressBit" />
        <meta name="twitter:description" content="Expert guides on local client-side file compression, PDF split/merge workflows, and browser cryptography." />
        <meta name="twitter:image" content="https://www.compressbit.com/og-image.png" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-20 md:pb-0">
        <Header />

        <main className="flex-grow pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Page Header */}
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Knowledge & Resources
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Explore deep dives into PDF optimization, file compression secrets, and local browser cryptography standards.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10 max-w-4xl mx-auto">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 bg-card border border-border rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Tags Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedTag === tag
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-card border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, idx) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <Link to={`/blog/${post.slug}`} className="block h-full group">
                      <Card className="p-6 h-full flex flex-col justify-between bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                        <div className="space-y-4">
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {post.tags.map(t => (
                              <Badge key={t} variant="secondary" className="bg-muted text-muted-foreground border-none font-semibold text-[10px]">
                                {t}
                              </Badge>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xl font-bold leading-snug group-hover:text-primary transition-colors duration-200">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-border/50 mt-6 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {post.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {post.readTime}
                            </span>
                          </div>
                          
                          <span className="text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <p className="text-base font-medium">No articles found matching your criteria.</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedTag('All'); }} className="text-primary font-bold hover:underline mt-2">
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};
export default BlogPage;
