import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, ShoppingBag, CheckCircle2, Circle } from 'lucide-react';
import { Recipe, Ingredient } from '../types';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
  onAddToShoppingList: (ingredient: string) => void;
  shoppingList: string[];
}

const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose, onAddToShoppingList, shoppingList }) => {
  const [currentStep, setCurrentStep] = useState<number>(-1); // -1 for ingredients view
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onstart = () => setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Stop speaking when component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (currentStep >= 0 && currentStep < recipe.steps.length) {
      speak(`Step ${currentStep + 1}. ${recipe.steps[currentStep]}`);
    } else if (currentStep === -1) {
      speak(`Let's cook ${recipe.name}. Here are the ingredients.`);
    }
  }, [currentStep, recipe]);

  const handleNext = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finished
      speak("Enjoy your meal!");
      // Could show a celebration screen here
      setCurrentStep(recipe.steps.length);
    }
  };

  const handlePrev = () => {
    if (currentStep > -1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isFinished = currentStep === recipe.steps.length;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Cooking Mode</h2>
          <span className="text-emerald-600 font-bold truncate max-w-[200px]">{recipe.name}</span>
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto bg-slate-50 flex flex-col items-center justify-center p-6">
        
        {/* Ingredients Overview */}
        {currentStep === -1 && (
          <div className="w-full max-w-md animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">Gather Ingredients</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {recipe.ingredients.map((ing, idx) => {
                  const isMissing = ing.isMissing;
                  const inList = shoppingList.includes(ing.name);
                  
                  return (
                    <li key={idx} className="p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isMissing ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <div>
                          <p className="font-medium text-slate-800">{ing.name}</p>
                          <p className="text-sm text-slate-500">{ing.quantity}</p>
                        </div>
                      </div>
                      
                      {isMissing && (
                        <button 
                          onClick={() => onAddToShoppingList(ing.name)}
                          disabled={inList}
                          className={`
                            px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all
                            ${inList 
                              ? 'bg-slate-100 text-slate-400' 
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}
                          `}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          {inList ? 'Added' : 'Add to List'}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Steps */}
        {currentStep >= 0 && !isFinished && (
          <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in">
             <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm mb-4">
                Step {currentStep + 1} of {recipe.steps.length}
             </div>
             <p className="text-3xl md:text-4xl font-medium text-slate-800 leading-tight">
               {recipe.steps[currentStep]}
             </p>
             <button 
              onClick={() => speak(recipe.steps[currentStep])}
              className={`mt-4 p-4 rounded-full ${isSpeaking ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 hover:text-emerald-500 shadow-sm border border-slate-200'} transition-all`}
             >
               <Volume2 className={`w-8 h-8 ${isSpeaking ? 'animate-pulse' : ''}`} />
             </button>
          </div>
        )}

        {/* Finished */}
        {isFinished && (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bon Appétit!</h1>
            <p className="text-slate-500 mb-8">You've completed this recipe.</p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-emerald-600 text-white rounded-full font-semibold shadow-lg hover:bg-emerald-700 transition-colors"
            >
              Back to Recipes
            </button>
          </div>
        )}

      </div>

      {/* Controls */}
      {!isFinished && (
        <div className="bg-white border-t border-slate-100 p-6 flex justify-between items-center max-w-4xl mx-auto w-full">
           <button 
             onClick={handlePrev}
             disabled={currentStep === -1}
             className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
           >
             <ChevronLeft className="w-5 h-5" />
             Back
           </button>

           <div className="flex gap-1">
             <div className={`h-2 w-2 rounded-full transition-all ${currentStep === -1 ? 'bg-emerald-500 w-6' : 'bg-slate-200'}`} />
             {recipe.steps.map((_, idx) => (
                <div key={idx} className={`h-2 w-2 rounded-full transition-all ${currentStep === idx ? 'bg-emerald-500 w-6' : 'bg-slate-200'}`} />
             ))}
           </div>

           <button 
             onClick={handleNext}
             className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-200 transition-all"
           >
             {currentStep === -1 ? 'Start Cooking' : (currentStep === recipe.steps.length - 1 ? 'Finish' : 'Next Step')}
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      )}
    </div>
  );
};

export default CookingMode;
