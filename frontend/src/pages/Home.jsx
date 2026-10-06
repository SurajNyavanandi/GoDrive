import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: 'High Performance',
      description: 'Built with modern tooling for lightning fast load times and seamless user interactions.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Engineered with production-grade security practices, rate limiting, and robust authentication.',
    },
    {
      icon: Sparkles,
      title: 'Modular Architecture',
      description: 'Clean separation of concerns designed to easily scale and adapt to any business requirement.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      <SEO
        title="Home | Modern Web Application"
        description="A modern, clean, responsive starter boilerplate for web applications."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
            <span>✨ Welcome to Your New Project</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Build your next great idea with confidence
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A clean, responsive, production-ready foundation designed to accelerate your development workflow from day one.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/contact"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/10 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/about"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm rounded-xl transition-all shadow-2xs"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Feature Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Core Highlights
          </h2>
          <p className="text-sm text-slate-500">
            Everything you need to deliver high quality web experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold">Ready to take the next step?</h3>
            <p className="text-sm text-slate-300 max-w-md">
              Start building out your custom features or contact us to discuss your requirements.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-colors shrink-0 shadow-xs"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
