import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, LayoutGrid, RotateCw, Upload, Plus, ArrowRight, Archive, ChevronDown, ChevronRight, ChevronLeft, X } from 'lucide-react';
import JSZip from 'jszip';
import Header from './components/Header';
import BlueprintCard from './components/BlueprintCard';
import { analyzeImage, generateTechnicalView } from './services/geminiService';
import { AnalysisResponse, AppState, GeneratedImage } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Source Image Data
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceBase64, setSourceBase64] = useState<string | null>(null);
  const [sourceMime, setSourceMime] = useState<string | null>(null);

  // Analysis Data
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  
  // UI State
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Generated Images Data - Initialize with 4 placeholders for Front, Top, Back, Side
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([
    { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
    { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
    { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
    { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
  ]);

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setSourceImage(null);
    setSourceBase64(null);
    setSourceMime(null);
    setAnalysis(null);
    setIsLogOpen(false);
    setSelectedImageIndex(null);
    // Reset to generic placeholders
    setGeneratedImages([
        { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
        { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
        { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
        { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
    ]);
  };

  const handleDownloadArchive = async () => {
    const zip = new JSZip();
    let hasImages = false;

    generatedImages.forEach((img, index) => {
      if (img.imageUrl) {
        hasImages = true;
        // Extract base64 content
        const base64Data = img.imageUrl.split(',')[1];
        const fileName = `View_${index + 1}_${img.viewName.toUpperCase()}.png`;
        zip.file(fileName, base64Data, { base64: true });
      }
    });

    if (!hasImages) return;

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'AutoCAD_Drafter_Blueprints.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to create archive", error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please upload an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 data without prefix for API
      const base64Data = result.split(',')[1];
      
      // Trigger update logic
      setSourceBase64(base64Data);
      setSourceMime(file.type);
      setSourceImage(result);
      
      // Reset state if re-uploading
      setAppState(AppState.IDLE);
      setAnalysis(null);
      setGeneratedImages([
        { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
        { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
        { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
        { viewName: 'PENDING', imageUrl: null, loading: false, prompt: '' },
      ]);
      
      // Auto start process
      processImage(base64Data, file.type);
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const processImage = async (base64: string, mimeType: string) => {
    setAppState(AppState.ANALYZING);

    // Update placeholders to show loading/analyzing state
    setGeneratedImages(prev => prev.map(img => ({ ...img, loading: true })));

    try {
      // Step 1: Analyze Image
      const result = await analyzeImage(base64, mimeType);
      setAnalysis(result);
      
      // Define standard order for grid
      const viewOrder = ['front', 'top', 'back', 'side'];
      
      // Step 2: Prepare data for generation
      // We set loading to true immediately because we are skipping the review step
      const imagesToGenerate: GeneratedImage[] = viewOrder.map(view => ({
        viewName: view,
        imageUrl: null,
        loading: true, 
        prompt: result.prompts[view] || ''
      }));
      
      setGeneratedImages(imagesToGenerate);
      setAppState(AppState.GENERATING);

      // Step 3: Automatically Generate Views
      const promises = imagesToGenerate.map(async (img) => {
        try {
          const url = await generateTechnicalView(img.prompt);
          return { ...img, imageUrl: url, loading: false };
        } catch (e) {
          console.error(`Failed to generate ${img.viewName}`, e);
          return { ...img, loading: false };
        }
      });

      const results = await Promise.all(promises);
      setGeneratedImages(results);
      setAppState(AppState.COMPLETE);

    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try a different image.");
      resetApp();
    }
  };

  // Gallery Navigation Logic
  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex === null) return;
    const nextIndex = selectedImageIndex >= generatedImages.length - 1 ? 0 : selectedImageIndex + 1;
    if (generatedImages[nextIndex].imageUrl) {
      setSelectedImageIndex(nextIndex);
    } else {
        // Skip if waiting/loading (though this shouldn't happen often in COMPLETE state)
        setSelectedImageIndex(nextIndex);
    }
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex === null) return;
    const prevIndex = selectedImageIndex <= 0 ? generatedImages.length - 1 : selectedImageIndex - 1;
    if (generatedImages[prevIndex].imageUrl) {
       setSelectedImageIndex(prevIndex);
    } else {
        setSelectedImageIndex(prevIndex);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImageIndex === null) return;
    if (e.key === 'ArrowRight') handleNextImage();
    if (e.key === 'ArrowLeft') handlePrevImage();
    if (e.key === 'Escape') setSelectedImageIndex(null);
  };

  useEffect(() => {
    if (selectedImageIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex]);


  return (
    <div className="min-h-screen bg-black pb-20 relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-technical-grid pointer-events-none opacity-40 z-0"></div>
      
      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          
          {/* Intro Text - Technical Header */}
          <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase font-mono">
                Projection<span className="text-lime-500">_</span>Generator
              </h2>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest max-w-lg">
                // System Status: Ready
                <br />
                // Load Source object to initiate inference engine
              </p>
            </div>
          </div>

          {/* New Upload Button Bar */}
          <div 
            onClick={handleUploadClick}
            className="mb-8 group relative w-full h-16 border border-zinc-800 hover:border-lime-500/50 bg-zinc-900/20 hover:bg-lime-900/10 cursor-pointer transition-all duration-300 flex items-center justify-between px-6 overflow-hidden"
          >
             {/* Decorative Corners */}
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-600 group-hover:border-lime-500 transition-colors"></div>
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-600 group-hover:border-lime-500 transition-colors"></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-600 group-hover:border-lime-500 transition-colors"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-600 group-hover:border-lime-500 transition-colors"></div>
             
             <div className="flex items-center gap-4">
               {sourceImage ? (
                  <div className="relative">
                    <img src={sourceImage} alt="Source" className="h-10 w-10 object-cover border border-lime-500/50 rounded-sm" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
                  </div>
               ) : (
                  <div className="p-2 bg-lime-500/10 rounded-sm group-hover:bg-lime-500 group-hover:text-black transition-colors text-lime-500">
                      <Upload className="w-5 h-5" />
                  </div>
               )}
               
               <div className="flex flex-col">
                 <span className="text-sm font-mono font-bold uppercase tracking-widest text-zinc-400 group-hover:text-lime-400 transition-colors">
                   {sourceImage ? "Source Loaded" : "Upload Source Image"}
                 </span>
                 {sourceImage && (
                   <span className="text-[10px] font-mono text-zinc-600 uppercase">Click to replace</span>
                 )}
               </div>
             </div>

             <div className="hidden sm:flex items-center gap-2 text-zinc-600 group-hover:text-lime-500/50 transition-colors">
               <Plus className="w-4 h-4" />
               <span className="text-[10px] font-mono uppercase tracking-widest">INPUT_SLOT_01</span>
             </div>

             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               onChange={handleFileUpload} 
               accept="image/*" 
             />
          </div>

          {/* Status / Controls Bar */}
          {appState !== AppState.IDLE && (
            <div className="mb-8">
                {appState === AppState.ANALYZING || appState === AppState.GENERATING ? (
                     <div className="flex items-center justify-center p-4 bg-lime-500/5 border border-lime-500/20 border-dashed animate-pulse">
                        <RefreshCw className="w-4 h-4 text-lime-500 animate-spin mr-3" />
                        <p className="text-lime-400 font-mono text-xs uppercase tracking-widest">
                          {appState === AppState.ANALYZING ? "Processing Geometry..." : "Rendering Orthographic Views..."}
                        </p>
                     </div>
                ) : (
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center bg-zinc-900/30 p-4 border border-zinc-800 gap-4 animate-in fade-in duration-500 relative overflow-hidden">
                      {/* Decorative colored line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-500"></div>

                      <div className="pl-2">
                        <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-2 uppercase font-mono tracking-wider">
                          <LayoutGrid className="w-3 h-3 text-lime-500"/>
                          Detected Orientation
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono">
                          TARGET: <span className="text-lime-400 bg-lime-500/10 px-2 py-0.5 border border-lime-500/20">{analysis?.detected_orientation || 'Unknown'}</span>
                        </p>
                      </div>

                      <div className="flex gap-4">
                        {appState === AppState.COMPLETE && (
                          <>
                            <button 
                              onClick={handleDownloadArchive}
                              className="px-5 py-2 text-xs font-mono uppercase tracking-wider transition-colors bg-lime-500 hover:bg-lime-400 text-black border border-lime-600 flex items-center gap-2"
                            >
                              <Archive className="w-3 h-3" />
                              Download_Archive
                            </button>
                            <button 
                              onClick={resetApp}
                              className="text-zinc-400 hover:text-white px-5 py-2 text-xs font-mono uppercase tracking-wider transition-colors border border-zinc-700 hover:border-zinc-500 bg-black flex items-center gap-2"
                            >
                              <RotateCw className="w-3 h-3" />
                              Reset_System
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                )}
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in duration-700">
            {generatedImages.map((img, index) => (
              <div key={index} className="xl:col-span-1 h-[400px]">
                <BlueprintCard 
                  title={`VIEW ${index + 1}: ${appState !== AppState.IDLE && img.viewName !== 'PENDING' ? img.viewName.toUpperCase() : 'WAITING'}`}
                  imageUrl={img.imageUrl}
                  isLoading={img.loading}
                  prompt={img.prompt}
                  statusText={appState === AppState.IDLE ? "NO_IMAGE" : "CALCULATING..."}
                  onExpand={() => {
                    if (img.imageUrl) setSelectedImageIndex(index);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Prompts Details Section (Collapsible) */}
          {(appState === AppState.REVIEW || appState === AppState.GENERATING || appState === AppState.COMPLETE) && (
              <div className="mt-16 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
                 <button 
                  onClick={() => setIsLogOpen(!isLogOpen)}
                  className="w-full flex items-center gap-3 mb-6 group cursor-pointer focus:outline-none"
                 >
                   <div className="h-1 w-1 bg-lime-500 group-hover:scale-150 transition-transform"></div>
                   <h4 className="text-white text-xs font-mono uppercase tracking-[0.2em] group-hover:text-lime-400 transition-colors">Generation_Log</h4>
                   <div className="flex-1 h-[1px] bg-zinc-800 group-hover:bg-zinc-700 transition-colors"></div>
                   <ChevronDown className={`w-4 h-4 text-zinc-500 group-hover:text-lime-500 transition-transform duration-300 ${isLogOpen ? 'rotate-180' : ''}`} />
                 </button>
                 
                 {isLogOpen && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                     {generatedImages.map((img, index) => (
                       <div key={index} className="bg-zinc-900/20 p-5 border border-zinc-800 hover:border-lime-500/30 transition-colors group">
                          <div className="flex items-center gap-2 mb-3">
                            <ArrowRight className="w-3 h-3 text-lime-500" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-lime-400 transition-colors">PROMPT_SEQ_{index + 1} ({img.viewName.toUpperCase()})</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-zinc-500 font-mono whitespace-pre-wrap group-hover:text-zinc-400 transition-colors">
                            {img.prompt || "// Pending sequence generation..."}
                          </p>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
          )}

        </main>
      </div>

      {/* Full Screen Image Gallery Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
           {/* Close Button */}
           <button 
             className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white border border-transparent hover:border-zinc-700 rounded transition-all z-50"
             onClick={() => setSelectedImageIndex(null)}
           >
             <X className="w-8 h-8" />
           </button>

           {/* Navigation Buttons */}
           <button 
             className="absolute left-4 md:left-8 p-4 text-zinc-400 hover:text-lime-500 border border-zinc-800 hover:border-lime-500/50 bg-black/50 hover:bg-zinc-900 transition-all rounded-full z-50 hidden md:flex"
             onClick={(e) => handlePrevImage(e)}
           >
             <ChevronLeft className="w-8 h-8" />
           </button>

           <button 
             className="absolute right-4 md:right-8 p-4 text-zinc-400 hover:text-lime-500 border border-zinc-800 hover:border-lime-500/50 bg-black/50 hover:bg-zinc-900 transition-all rounded-full z-50 hidden md:flex"
             onClick={(e) => handleNextImage(e)}
           >
             <ChevronRight className="w-8 h-8" />
           </button>
           
           {/* Main Image Container */}
           <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-12 relative" onClick={() => setSelectedImageIndex(null)}>
              <div 
                className="relative max-w-full max-h-full p-1 border border-lime-500/20 bg-zinc-950"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
              >
                {/* Decorative corners for modal */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-lime-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-lime-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-lime-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-lime-500"></div>

                <img 
                  src={generatedImages[selectedImageIndex].imageUrl || ''} 
                  alt={generatedImages[selectedImageIndex].viewName}
                  className="max-w-full max-h-[85vh] object-contain shadow-2xl shadow-black"
                  style={{ filter: 'grayscale(100%) contrast(1.1) brightness(1.1)' }}
                />
                
                {/* Image Label Overlay - Replaced gradient with solid technical bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-950/90 border-t border-zinc-800 flex justify-between items-end pointer-events-none">
                  <div>
                    <span className="text-lime-500 text-xs font-mono font-bold uppercase tracking-widest block mb-1">
                      VIEW {selectedImageIndex + 1}: {generatedImages[selectedImageIndex].viewName}
                    </span>
                    <span className="text-zinc-500 text-[10px] font-mono uppercase">
                      ORTHOGRAPHIC PROJECTION RENDER
                    </span>
                  </div>
                  <span className="text-zinc-600 font-mono text-xs">
                    {selectedImageIndex + 1} / {generatedImages.length}
                  </span>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;