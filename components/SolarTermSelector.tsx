import React from 'react';
import { SOLAR_TERMS, SEASON_ACCENT } from '../constants';
import { SolarTerm } from '../types';

interface SolarTermSelectorProps {
  currentTermId: number;
  onSelectTerm: (term: SolarTerm) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SolarTermSelector: React.FC<SolarTermSelectorProps> = ({ currentTermId, onSelectTerm, isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-stone-50 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif-sc font-bold text-stone-800">二十四节气</h2>
            <button onClick={onClose} className="text-stone-500 hover:text-stone-800 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="space-y-8">
            {['spring', 'summer', 'autumn', 'winter'].map((season) => (
              <div key={season}>
                <h3 className="text-sm uppercase tracking-widest text-stone-400 mb-3 font-bold">{season}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {SOLAR_TERMS.filter(t => t.season === season).map((term) => (
                    <button
                      key={term.id}
                      onClick={() => {
                        onSelectTerm(term);
                        onClose();
                      }}
                      className={`
                        p-3 rounded-lg text-left transition-all border
                        ${term.id === currentTermId 
                          ? `${SEASON_ACCENT[term.season as keyof typeof SEASON_ACCENT]} text-white border-transparent shadow-md` 
                          : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50'}
                      `}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="font-serif-sc text-lg font-bold">{term.name}</span>
                        <span className="text-xs opacity-70 font-mono">{term.date}</span>
                      </div>
                      <div className="text-xs mt-1 opacity-80 truncate">{term.enName}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SolarTermSelector;