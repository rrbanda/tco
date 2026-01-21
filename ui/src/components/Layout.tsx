import { useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  GitCompare, 
  FileText,
  HelpCircle,
  Menu,
  X,
  Github,
  ExternalLink
} from 'lucide-react';
import type { TabId } from '../lib/types';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const navItems: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'data', label: 'Data Input', icon: Database },
  { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3 },
  { id: 'scenarios', label: 'Scenarios', icon: GitCompare },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-200">
                <svg viewBox="0 0 40 40" className="w-7 h-7">
                  <polygon points="0,20 12,4 20,4 8,20 20,36 12,36" fill="#7cb342"/>
                  <polygon points="14,20 26,4 34,4 22,20 34,36 26,36" fill="#7cb342"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Chef TCO Analyzer</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Infrastructure Cost Analysis</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      activeTab === item.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* GitHub Link */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="hidden lg:inline">View on GitHub</span>
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      activeTab === item.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Chef TCO Analysis Toolkit &mdash; Data-driven infrastructure cost analysis
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#methodology"
                className="text-sm text-slate-600 hover:text-primary-600 transition-colors flex items-center gap-1"
              >
                Methodology
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 hover:text-primary-600 transition-colors flex items-center gap-1"
              >
                GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
