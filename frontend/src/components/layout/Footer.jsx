import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span className="font-semibold text-slate-800 text-sm">AppName</span>
          </div>

          <nav className="flex items-center gap-6 text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-slate-900 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-slate-900 transition-colors">
              Contact
            </Link>
          </nav>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} AppName. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
