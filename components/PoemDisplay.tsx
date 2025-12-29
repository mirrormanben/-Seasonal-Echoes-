import React, { useState, useRef, useEffect } from 'react';
import { Poem, SolarTerm } from '../types';
import { generatePoemAudio } from '../services/geminiService';

interface PoemDisplayProps {
  poem: Poem | null;
  term: SolarTerm;
  loading: boolean;
  onRefresh: () => void;
}

// Helper to decode base64 string
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode PCM audio data
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const PoemDisplay: React.FC<PoemDisplayProps> = ({ poem, term, loading, onRefresh }) => {
  
  // Audio State
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  // Presentation State
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup audio on unmount or when poem changes
  useEffect(() => {
    return () => {
      stopAudio();
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [poem]);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    setAudioState('idle');
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    setActiveLineIndex(0); // Reset scroll
  };

  const handlePlayAudio = async () => {
    if (audioState === 'playing') {
      stopAudio();
      return;
    }

    if (!poem) return;

    setAudioState('loading');
    setActiveLineIndex(0);

    try {
      const introText = `${poem.title}。${poem.author}`;
      const contentText = poem.content.join('。');
      const textToSpeak = `${introText}。${contentText}`;
      
      const base64Audio = await generatePoemAudio(textToSpeak);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const rawBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(rawBytes, ctx);

      // Heuristic for scroll timing
      const totalChars = introText.length + contentText.length;
      const avgTimePerChar = (audioBuffer.duration * 1000) / totalChars;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        stopAudio();
      };

      source.start();
      audioSourceRef.current = source;
      setAudioState('playing');

      // Start Timer for Lyrics
      const introDuration = introText.length * avgTimePerChar;
      const startTime = Date.now() + introDuration;
      
      scrollIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed < 0) return;

        let accumulatedTime = 0;
        let foundIndex = 0;
        
        for (let i = 0; i < poem.content.length; i++) {
           const lineDuration = poem.content[i].length * avgTimePerChar;
           if (elapsed < accumulatedTime + lineDuration) {
             foundIndex = i;
             break;
           }
           accumulatedTime += lineDuration;
           foundIndex = i;
        }
        
        setActiveLineIndex(foundIndex);

      }, 100);

    } catch (error) {
      console.error("Audio playback failed", error);
      setAudioState('idle');
      alert("Could not generate audio at this time.");
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fdfbf7] z-50">
        <div className="w-16 h-16 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-6"></div>
        <p className="font-calligraphy text-stone-800 text-3xl animate-pulse">研磨墨汁...</p>
        <p className="text-stone-500 text-xs mt-3 font-serif-sc tracking-widest uppercase">Consulting {term.name}</p>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 z-50 bg-[#fdfbf7]">
         <button onClick={onRefresh} className="px-8 py-3 border border-stone-800 text-stone-800 rounded-full hover:bg-stone-800 hover:text-white transition-colors font-serif-sc">
          Load Poetry
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#fdfbf7]">
      
      {/* 1. Background Layer: Ink Wash Painting */}
      {poem.imageUrl && (
        <div className="absolute inset-0 z-0 animate-fade-in transition-opacity duration-1000">
           <img 
             src={`data:image/png;base64,${poem.imageUrl}`} 
             alt="Background" 
             className="w-full h-full object-cover opacity-80"
           />
           {/* Paper Texture Overlay to ensure text readability */}
           <div className="absolute inset-0 bg-[#fdfbf7] opacity-40 mix-blend-hard-light pointer-events-none"></div>
           {/* Subtle gradient to fade bottom for text */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7]/60 to-transparent"></div>
        </div>
      )}

      {/* 2. Main Content Layer */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-10">
        
        {/* Top: Header & Controls */}
        <div className="flex flex-col items-center pt-8">
           <div className="text-stone-800/80 mb-2 font-serif-sc tracking-[0.5em] text-xs uppercase">{term.enName}</div>
           <h2 className="font-calligraphy text-5xl md:text-6xl text-stone-900 drop-shadow-sm">{term.name}</h2>
           
           <button 
              onClick={handlePlayAudio}
              className={`
                mt-6 w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 shadow-sm
                ${audioState === 'playing' 
                  ? 'bg-stone-800 text-white border-stone-800' 
                  : 'bg-white/80 text-stone-800 border-stone-300 hover:scale-105 hover:bg-stone-800 hover:text-white'}
              `}
            >
                {audioState === 'loading' ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : audioState === 'playing' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  )}
            </button>
        </div>

        {/* Center: Poem Lyrics (Karaoke) */}
        <div className="flex-1 flex flex-col justify-center items-center relative my-4">
            {/* Title & Clickable Author */}
            <div className="text-center mb-8">
               <h1 className="font-serif-sc text-3xl md:text-4xl font-bold text-stone-900 mb-2">{poem.title}</h1>
               <button 
                  onClick={() => setShowAuthorModal(true)}
                  className="font-serif-sc text-lg text-stone-600 border-b border-dashed border-stone-400 hover:text-stone-900 hover:border-stone-900 transition-colors cursor-pointer"
               >
                 {poem.dynasty} · {poem.author}
               </button>
            </div>

            {/* Scrolling Lyrics Window - Strictly 3 Lines */}
            <div className="h-[140px] w-full overflow-hidden relative flex flex-col items-center mask-image-linear-fade">
               <div 
                 className="transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center gap-6"
                 style={{ transform: `translateY(-${(activeLineIndex - 1) * 44}px)` }} // Adjust based on height
               >
                 {poem.content.map((line, idx) => {
                   const isActive = idx === activeLineIndex;
                   return (
                     <p 
                       key={idx} 
                       className={`
                         font-serif-sc text-2xl md:text-3xl h-[20px] md:h-[24px] flex items-center justify-center whitespace-nowrap transition-all duration-500
                         ${isActive 
                           ? 'text-stone-900 font-bold scale-110 opacity-100' 
                           : 'text-stone-500 scale-95 opacity-40 blur-[1px]'}
                       `}
                       style={{ textShadow: isActive ? '0 0 20px rgba(255,255,255,0.8)' : 'none' }}
                     >
                       {line}
                     </p>
                   );
                 })}
               </div>
            </div>
        </div>

        {/* Bottom: Visible Analysis & Background */}
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-4">
           
           {/* Translation (Moved to Top) */}
           <div className="border-b border-stone-200/50 pb-4">
              <p className="font-serif-sc text-stone-600 text-sm md:text-base text-center leading-relaxed max-w-2xl mx-auto italic">
                 {poem.translation}
              </p>
           </div>

           {/* Analysis & Background Grid (Below Translation) */}
           <div className="grid md:grid-cols-2 gap-6 md:gap-12 text-sm md:text-base">
              {/* Analysis */}
              <div className="space-y-1">
                 <h3 className="font-bold text-stone-400 text-xs uppercase tracking-widest">Appreciation</h3>
                 <p className="font-serif-sc text-stone-800 leading-relaxed italic">
                   "{poem.analysis}"
                 </p>
              </div>
              {/* Historical Context */}
              <div className="space-y-1">
                 <h3 className="font-bold text-stone-400 text-xs uppercase tracking-widest">Background</h3>
                 <p className="font-serif-sc text-stone-600 leading-relaxed">
                   {poem.background}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* 3. Floating Author Modal (Hidden by default) */}
      {showAuthorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div 
             className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
             onClick={() => setShowAuthorModal(false)}
           />
           
           <div className="relative bg-[#fdfbf7] rounded-xl shadow-2xl w-full max-w-md p-8 animate-scale-in border border-stone-200 flex flex-col items-center">
               <button 
                 onClick={() => setShowAuthorModal(false)}
                 className="absolute top-4 right-4 text-stone-400 hover:text-stone-800"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>

               <div className="w-16 h-16 rounded-full bg-stone-800 text-[#fdfbf7] flex items-center justify-center text-2xl font-calligraphy mb-4 shadow-lg">
                  {poem.author[0]}
               </div>
               <h3 className="font-serif-sc font-bold text-2xl text-stone-900">{poem.author}</h3>
               <p className="text-stone-500 text-sm font-serif-sc mb-6">{poem.dynasty}</p>
               
               <div className="w-8 h-1 bg-stone-200 mb-6"></div>

               <p className="text-stone-700 leading-relaxed font-serif-sc text-left w-full mb-6">
                 {poem.authorIntro}
               </p>

               <a 
                 href={`https://zh.wikipedia.org/wiki/${encodeURIComponent(poem.author)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="self-start text-xs text-stone-400 border-b border-stone-300 hover:text-stone-800 hover:border-stone-800 transition-colors flex items-center gap-1"
               >
                 View on Wikipedia
                 <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
               </a>
           </div>
        </div>
      )}
    </div>
  );
};

export default PoemDisplay;