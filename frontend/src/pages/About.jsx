import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function About() {
  const values = [
    'User-centered design and intuitive interfaces',
    'Reliable, secure, and modern engineering standards',
    'Rapid development with clean, maintainable architecture',
    'Continuous improvement and performance optimization',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <SEO
        title="About Us | Company Name"
        description="Learn more about our mission, vision, and core values."
      />

      {/* Header */}
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Us
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          We are dedicated to building fast, dependable, and impactful web solutions designed to help businesses and developers thrive.
        </p>
      </div>

      {/* Mission Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Our mission is to simplify the complex and empower creators with reliable tools. Whether you are building an enterprise portal or a focused consumer product, we prioritize clarity, speed, and precision in every line of code.
        </p>
      </section>

      {/* Core Values */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Core Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {values.map((val) => (
            <div
              key={val}
              className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs"
            >
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-700 font-medium">{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-100/80 rounded-2xl">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Have any questions?</h3>
          <p className="text-xs text-slate-500">We would love to hear from you.</p>
        </div>
        <Link
          to="/contact"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
        >
          <span>Get in Touch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
