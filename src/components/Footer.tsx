import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-normal text-slate-600">
          © 2026 AI Citation Reverse Engineering. Developed by <strong className="font-semibold text-violet-600">Ami - SEO Girl</strong>. All rights reserved.
        </p>
        <p className="text-slate-400">
          Cross-platform citation diagnostics for SEO and content intelligence.
        </p>
      </div>
    </footer>
  );
};
