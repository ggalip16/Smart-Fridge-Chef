import React from 'react';
import { Clock, Activity, ChefHat } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const missingCount = recipe.ingredients.filter(i => i.isMissing).length;

  return (
    <div 
      onClick={() => onSelect(recipe)}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
          <div className="flex gap-1">
            {recipe.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                {tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                +{recipe.tags.length - 2}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
          {recipe.name}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        <div className="mt-auto flex items-center justify-between text-sm text-slate-600 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span>{recipe.calories} kcal</span>
          </div>
        </div>
        
        {missingCount > 0 && (
          <div className="mt-3 text-xs text-amber-600 font-medium flex items-center gap-1">
             <ChefHat className="w-3 h-3" />
             Missing {missingCount} ingredient{missingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
