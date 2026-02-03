import React from 'react';
import { View } from '../types';
import { ICONS } from '../constants';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-6 py-4 flex justify-around items-center z-50">
      <button 
        onClick={() => setView('home')} 
        className={`p-2 transition-colors ${currentView === 'home' || currentView === 'answer' || currentView === 'collective' ? 'text-stone-900' : 'text-stone-300'}`}
      >
        <span className="text-xs font-medium uppercase tracking-widest">Início</span>
      </button>
      <button 
        onClick={() => setView('history')} 
        className={`p-2 transition-colors ${currentView === 'history' ? 'text-stone-900' : 'text-stone-300'}`}
      >
        <span className="text-xs font-medium uppercase tracking-widest">Jornada</span>
      </button>
      <button 
        onClick={() => setView('about')} 
        className={`p-2 transition-colors ${currentView === 'about' ? 'text-stone-900' : 'text-stone-300'}`}
      >
        <span className="text-xs font-medium uppercase tracking-widest">Sobre</span>
      </button>
    </nav>
  );
};
