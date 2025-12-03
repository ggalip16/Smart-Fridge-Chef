import React, { useState, useMemo } from 'react';
import { ChefHat, ShoppingCart, Filter, ArrowLeft, Plus } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import RecipeCard from './components/RecipeCard';
import CookingMode from './components/CookingMode';
import { analyzeFridgeImage } from './services/geminiService';
import { Recipe, DietaryFilter } from './types';

function App() {
  const [view, setView] = useState<'upload' | 'results' | 'cooking'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>(DietaryFilter.ALL);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  const handleImageSelected = async (base64: string) => {
    setIsLoading(true);
    try {
      const result = await analyzeFridgeImage(base64);
      setRecipes(result.recipes);
      setDetectedIngredients(result.detectedIngredients);
      setView('results');
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecipes = useMemo(() => {
    if (dietaryFilter === DietaryFilter.ALL) return recipes;
    return recipes.filter(r => r.tags.some(tag => tag.toLowerCase() === dietaryFilter.toLowerCase()));
  }, [recipes, dietaryFilter]);

  const addToShoppingList = (ingredient: string) => {
    if (!shoppingList.includes(ingredient)) {
      setShoppingList(prev => [...prev, ingredient]);
    }
  };

  const removeFromShoppingList = (ingredient: string) => {
    setShoppingList(prev => prev.filter(i => i !== ingredient));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {view === 'results' && (
              <button onClick={() => setView('upload')} className="mr-2 p-2 rounded-full hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <ChefHat className="w-8 h-8 text-emerald-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 hidden sm:block">
              Smart Fridge Chef
            </h1>
          </div>
          
          <button 
            onClick={() => setIsShoppingListOpen(!isShoppingListOpen)}
            className="relative p-2 bg-slate-100 hover:bg-emerald-50 rounded-full transition-colors group"
          >
            <ShoppingCart className="w-6 h-6 text-slate-600 group-hover:text-emerald-600" />
            {shoppingList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {shoppingList.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {view === 'upload' ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4">
             <div className="text-center mb-10 max-w-lg">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  What's in your <span className="text-emerald-600">fridge?</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Upload a photo of your open fridge or ingredients. 
                  Our AI will identify them and create delicious recipes just for you.
                </p>
             </div>
             <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} />
             
             {/* Features Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full px-4">
               {[
                 { title: "Visual Recognition", desc: "Instantly identifies ingredients from photos" },
                 { title: "Dietary Filters", desc: "Keto, Vegan, Gluten-Free options available" },
                 { title: "Step-by-Step Cooking", desc: "Voice-guided instructions for hands-free cooking" }
               ].map((f, i) => (
                 <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                   <p className="text-sm text-slate-500">{f.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
            
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                 <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
                   <Filter className="w-4 h-4" />
                   Filters
                 </div>
                 <div className="space-y-2">
                   {Object.values(DietaryFilter).map((filter) => (
                     <button
                       key={filter}
                       onClick={() => setDietaryFilter(filter)}
                       className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                         dietaryFilter === filter 
                           ? 'bg-emerald-100 text-emerald-800' 
                           : 'hover:bg-slate-50 text-slate-600'
                       }`}
                     >
                       {filter}
                     </button>
                   ))}
                 </div>

                 <div className="mt-8 pt-6 border-t border-slate-100">
                   <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Detected Items</h3>
                   <div className="flex flex-wrap gap-2">
                     {detectedIngredients.map((ing, i) => (
                       <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                         {ing}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
            </aside>

            {/* Recipe Grid */}
            <div className="flex-grow">
               <div className="mb-6">
                 <h2 className="text-2xl font-bold text-slate-900">Suggested Recipes</h2>
                 <p className="text-slate-500">Based on your ingredients and preferences</p>
               </div>
               
               {filteredRecipes.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No recipes found for this filter.</p>
                    <button 
                      onClick={() => setDietaryFilter(DietaryFilter.ALL)}
                      className="mt-4 text-emerald-600 font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredRecipes.map((recipe) => (
                     <RecipeCard 
                       key={recipe.id} 
                       recipe={recipe} 
                       onSelect={(r) => {
                         setSelectedRecipe(r);
                         setView('cooking');
                       }} 
                     />
                   ))}
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      {/* Shopping List Drawer (Right Side) */}
      {isShoppingListOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsShoppingListOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Shopping List</h2>
              <button onClick={() => setIsShoppingListOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <ArrowLeft className="w-5 h-5 text-slate-500 rotate-180" />
              </button>
            </div>
            
            {shoppingList.length === 0 ? (
               <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-400">
                 <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                 <p>Your list is empty.</p>
                 <p className="text-sm mt-1">Add missing ingredients from recipes.</p>
               </div>
            ) : (
              <ul className="flex-grow overflow-y-auto space-y-2">
                {shoppingList.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                    <span className="font-medium text-slate-700">{item}</span>
                    <button 
                      onClick={() => removeFromShoppingList(item)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="w-5 h-5 rotate-45" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-100">
               <button 
                 onClick={() => alert("Feature: Copy to clipboard or send to Instacart would go here!")}
                 className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
               >
                 Checkout
               </button>
            </div>
          </div>
        </>
      )}

      {/* Cooking Mode Overlay */}
      {view === 'cooking' && selectedRecipe && (
        <CookingMode 
          recipe={selectedRecipe} 
          onClose={() => setView('results')} 
          shoppingList={shoppingList}
          onAddToShoppingList={addToShoppingList}
        />
      )}
    </div>
  );
}

export default App;
