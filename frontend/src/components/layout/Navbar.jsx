import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, User, LogOut, LayoutDashboard } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              G
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">
              Go<span className="text-blue-600">Drive</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between pt-1">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-semibold text-blue-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-xs text-rose-600 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
