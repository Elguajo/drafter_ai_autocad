import React from 'react';
import { Loader2, Upload, Plus } from 'lucide-react';

interface BlueprintCardProps {
  title: string;
  imageUrl?: string | null;
  isLoading: boolean;
  prompt?: string;
  statusText?: string;
  onUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExpand?: () => void;
}

const BlueprintCard: React.FC<BlueprintCardProps> = ({ 
  title, 
  imageUrl, 
  isLoading, 
  prompt, 
  statusText = "Waiting for generation...",
  onUpload,
  onExpand
}) => {
  return (
    <div className="group relative flex flex-col h-full bg-zinc-950 border border-zinc-800 hover:border-lime-500/50 transition-colors duration-300">
      
      {/* Corner Brackets (Technical Decoration) */}
      <div className="absolute top-0 left-0 w-2 h-[1px] bg-zinc-600 group-hover:bg-lime-500 transition-colors"></div>
      <div className="absolute top-0 left-0 h-2 w-[1px] bg-zinc-600 group-hover:bg-lime-500 transition-colors"></div>
      
      <div className="absolute top-0 right-0 w-2 h-[1px] bg-zinc-600 group-hover:bg-lime-500 transition-colors"></div>
      <div className="absolute top-0 right-0 h-2 w-[1px] bg-zinc-600 group-hover:bg-lime-500 transition-colors"></div>
      
      <div className="absolute bottom-0 left-0 w-2 h-[1px] bg-zinc-600 group-hover:bg-lime-500 transition-colors"></div>
      <div className="absolute bottom-0 left-0 h-2 w-[1px] bg-zinc-600 group-hover:bg-lime-500 transition-colors"></div>
      
      <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-zinc-600 group-hover:bg-lime-500 transition-colors"></div>
      <div className="absolute bottom-0 right-0 h-2 w-[1px] bg-zinc-600 group-hover:bg-lime-500 transition-colors"></div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center shrink-0 bg-zinc-950/50">
        <div className="flex items-center gap-3">
           <div className={`w-1.5 h-1.5 ${imageUrl ? 'bg-lime-500' : 'bg-zinc-700'} shadow-[0_0_8px_rgba(132,204,22,0.4)]`}></div>
           <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 group-hover:text-lime-400 transition-colors">{title}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative w-full min-h-[320px] flex items-center justify-center p-1 bg-black">
        
        {/* Inner Border/Frame */}
        <div className="w-full h-full border border-zinc-900/50 relative overflow-hidden flex items-center justify-center">
          
          {/* Background Grid */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          ></div>
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
              backgroundSize: '10px 10px'
            }}
          ></div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-lime-500 animate-spin" />
                <div className="absolute inset-0 blur-lg bg-lime-500/20 animate-pulse"></div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-mono text-lime-400 uppercase tracking-widest animate-pulse">Processing Data</span>
                <span className="text-[10px] font-mono text-zinc-600">Please wait...</span>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center group/image overflow-hidden" onClick={onExpand}>
              <img 
                src={imageUrl} 
                alt={`${title} view`} 
                className="max-w-full max-h-[280px] object-contain relative z-10 p-4 cursor-zoom-in transition-transform duration-500 group-hover/image:scale-105"
                style={{ filter: 'grayscale(100%) contrast(1.1) brightness(1.1)' }} // Technical look
              />
              <div className="absolute inset-0 bg-lime-500/0 group-hover/image:bg-lime-500/5 transition-colors z-20 pointer-events-none"></div>
            </div>
          ) : onUpload ? (
            // Upload State UI
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer group/upload absolute inset-0 z-10 hover:bg-lime-900/5 transition-colors">
               <div className="relative flex flex-col items-center p-8 border border-dashed border-zinc-700 group-hover/upload:border-lime-500/50 transition-colors">
                 <div className="mb-4 text-zinc-600 group-hover/upload:text-lime-500 transition-colors">
                   <Upload className="w-8 h-8" />
                 </div>
                 <div className="flex items-center gap-2 mb-2">
                   <Plus className="w-3 h-3 text-lime-500" />
                   <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest group-hover/upload:text-lime-400 transition-colors">Load Source</span>
                 </div>
                 <span className="text-[9px] text-zinc-600 font-mono text-center max-w-[120px]">SUPPORTED: PNG, JPG MAX SIZE: 5MB</span>
                 
                 {/* Decorative corners for upload box */}
                 <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-zinc-500 group-hover/upload:border-lime-500"></div>
                 <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-zinc-500 group-hover/upload:border-lime-500"></div>
                 <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-zinc-500 group-hover/upload:border-lime-500"></div>
                 <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-zinc-500 group-hover/upload:border-lime-500"></div>
               </div>
               <input type="file" className="hidden" onChange={onUpload} accept="image/*" />
            </label>
          ) : (
            // Empty State UI
             <div className="flex flex-col items-center justify-center text-zinc-500">
                <div className="w-full h-[1px] bg-zinc-800/50 absolute top-1/2 left-0"></div>
                <div className="h-full w-[1px] bg-zinc-800/50 absolute top-0 left-1/2"></div>
                <span className="relative z-10 text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-black px-2 border border-zinc-900">{statusText}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlueprintCard;