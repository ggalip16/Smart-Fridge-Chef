export interface Ingredient {
  name: string;
  quantity: string;
  isMissing: boolean;
}

export interface Recipe {
  id: string; // generated UUID or index
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: string;
  calories: number;
  tags: string[]; // e.g., "Vegetarian", "Keto", "Gluten-Free"
  ingredients: Ingredient[];
  steps: string[];
}

export enum DietaryFilter {
  ALL = 'All',
  VEGETARIAN = 'Vegetarian',
  VEGAN = 'Vegan',
  KETO = 'Keto',
  GLUTEN_FREE = 'Gluten-Free',
}

export interface AnalysisResult {
  detectedIngredients: string[];
  recipes: Recipe[];
}
