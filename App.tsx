import React, { useState, useEffect, useCallback } from 'react';
import { SOLAR_TERMS } from './constants';
import { SolarTerm, Poem, FetchState } from './types';
import SolarTermSelector from './components/SolarTermSelector';
import PoemDisplay from './components/PoemDisplay';
import { fetchPoemForSolarTerm, generatePoemImage } from './services/geminiService';

function App() {
  const [currentTerm, setCurrentTerm] = useState<SolarTerm>(SOLAR_TERMS[0]);
  const [poem, setPoem] = useState<Poem | null>(null);
  const [status, setStatus] = useState<FetchState>(FetchState.IDLE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Function to determine current solar term based on date
  const determineInitialTerm = useCallback(() => {
    const now = new Date();
    // Format: MM-DD
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Convert dates to comparable numbers (e.g. "02-04" -> 204)
    const getVal = (d: string) => parseInt(d.replace('-', ''));
    const todayVal = getVal(`${month}-${day}`);

    let foundTerm = null;

    // 1. Check normal chronological order (Spring -> Winter)
    for (let i = 0; i < SOLAR_TERMS.length; i++) {
      const termVal = getVal(SOLAR_TERMS[i].date);
      if (todayVal >= termVal) {
        foundTerm = SOLAR_TERMS[i];
      }
    }

    // 2. Handle Year Rollover (January dates)
    // If we haven't found a term yet (because today is Jan 05 and it's smaller than Feb 04),
    // OR if the found term is technically "late in the year" but before the "new year starts",
    // we need to check the end of the list.
    
    // Specifically, if today is smaller than the first term (Start of Spring, Feb 04),
    // it must be one of the last terms of the "previous" cycle (Minor Cold, Major Cold).
    if (todayVal < getVal(SOLAR_TERMS[0].date)) {
         // Check strictly against the Winter terms at the end of the array
         const daHan = SOLAR_TERMS[23]; // Jan 20
         const xiaoHan = SOLAR_TERMS[22]; // Jan 05
         
         if (todayVal >= getVal(daHan.date)) {
             foundTerm = daHan;
         } else if (todayVal >= getVal(xiaoHan.date)) {
             foundTerm = xiaoHan;
         } else {
             // If it's Jan 1-4, it's still Winter Solstice (from Dec)
             foundTerm = SOLAR_TERMS[21]; 
         }
    }

    if (foundTerm) {
        setCurrentTerm(foundTerm);
    }
  }, []);

  useEffect(() => {
    determineInitialTerm();
  }, [determineInitialTerm]);

  // Fetch poem when term changes or user requests refresh
  const getPoem = useCallback(async (term: SolarTerm) => {
    setStatus(FetchState.LOADING);
    setPoem(null);
    setErrorMsg(null);
    
    try {
      // 1. Fetch Text Content
      const result = await fetchPoemForSolarTerm(term.name);
      setPoem(result);
      setStatus(FetchState.SUCCESS);

      // 2. Fetch Image (Asynchronously - don't block the UI)
      try {
        const imagePrompt = `Traditional Chinese ink wash painting landscape for the poem "${result.title}" about solar term ${term.name}. Scene: ${result.content.join(' ')}`;
        const imageBase64 = await generatePoemImage(imagePrompt);
        
        // Update state with image
        setPoem(prevPoem => {
          // Verify we are still updating the same poem title to avoid race conditions
          if (prevPoem && prevPoem.title === result.title) {
            return { ...prevPoem, imageUrl: imageBase64 };
          }
          return prevPoem;
        });
      } catch (imgError) {
        console.error("Failed to generate image:", imgError);
      }

    } catch (error) {
      console.error(error);
      setStatus(FetchState.ERROR);
      setErrorMsg("Failed to consult the spirits of poetry. Please try again.");
    }
  }, []);

  // Initial fetch when currentTerm is set for the first time
  useEffect(() => {
    if (status === FetchState.IDLE && currentTerm) {
        getPoem(currentTerm);
    }
  }, [currentTerm, status, getPoem]);

  const handleTermChange = (term: SolarTerm) => {
    setCurrentTerm(term);
    getPoem(term);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-stone-900">
      
      {/* Header - Absolute to sit on top of background */}
      <header className="fixed top-0 left-0 right-0 p-6 z-40 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto text-white/90 drop-shadow-md">
           <h1 className="text-2xl md:text-3xl font-serif-sc font-bold tracking-tighter">
             二十四<span className="font-light opacity-80">节气</span>
           </h1>
           <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] mt-1 opacity-70">Solar Terms Poetry</p>
        </div>
        
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="pointer-events-auto bg-black/20 backdrop-blur-md p-3 rounded-full border border-white/20 hover:bg-white/20 transition-all text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="h-full w-full relative">
        {status === FetchState.ERROR ? (
            <div className="absolute inset-0 flex items-center justify-center z-30">
               <div className="text-center p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 max-w-md mx-4">
                  <p className="text-red-300 font-serif-sc mb-4">{errorMsg}</p>
                  <button 
                    onClick={() => getPoem(currentTerm)}
                    className="px-6 py-2 bg-white/10 border border-white/30 text-white rounded-full hover:bg-white/20 transition-colors"
                  >
                    Try Again
                  </button>
               </div>
            </div>
        ) : (
            <PoemDisplay 
              poem={poem} 
              term={currentTerm} 
              loading={status === FetchState.LOADING} 
              onRefresh={() => getPoem(currentTerm)}
            />
        )}
      </main>

      {/* Sidebar */}
      <SolarTermSelector 
        currentTermId={currentTerm.id}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectTerm={handleTermChange}
      />
    </div>
  );
}

export default App;