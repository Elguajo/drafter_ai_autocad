import React from 'react';
import { PenTool, Terminal } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-8 h-8 border border-lime-500/50 bg-lime-500/10">
            <PenTool className="h-4 w-4 text-lime-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight uppercase font-mono flex items-center gap-3">
              AutoCAD Drafter AI
              <span className="text-[10px] bg-zinc-900 text-lime-400 px-1.5 py-0.5 border border-zinc-800">v1.0</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-6">
           <div className="hidden sm:flex items-center space-x-2 text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
             <span className="w-1.5 h-1.5 bg-lime-500/50 rounded-full animate-pulse"></span>
             <span>System Online</span>
           </div>
           <div className="flex items-center space-x-2 text-[10px] text-zinc-600 font-mono border-l border-zinc-800 pl-6">
             <Terminal className="w-3 h-3" />
             <span>GEMINI-2.5-FLASH</span>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;