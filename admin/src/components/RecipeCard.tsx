'use client';

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    image: string;
    prepTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    isPremium: boolean;
    hasVideo?: boolean;
  };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const difficultyLabels = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil'
  };

  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400'
  };

  return (
    <div className="recipe-card animate-on-scroll">
      <div className="recipe-image relative" style={{ backgroundImage: `url(${recipe.image})` }}>
        <div className="recipe-overlay"></div>
        
        {/* Premium Badge */}
        {recipe.isPremium && (
          <div className="premium-badge">
            <i className="bx bx-crown mr-1"></i>
            Premium
          </div>
        )}

        {/* Video Play Button */}
        {recipe.hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="bg-primary/90 hover:bg-primary text-white rounded-full p-4 transition-all duration-300 hover:scale-110">
              <i className="bx bx-play text-2xl"></i>
            </button>
          </div>
        )}

        {/* Favorite Button */}
        <button className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300">
          <i className="bx bx-heart text-lg"></i>
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-text mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        
        <p className="text-text-light text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center text-text-light">
              <i className="bx bx-time mr-1"></i>
              {recipe.prepTime}min
            </span>
            <span className={`flex items-center ${difficultyColors[recipe.difficulty]}`}>
              <i className="bx bx-dumbbell mr-1"></i>
              {difficultyLabels[recipe.difficulty]}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <i className="bx bxs-star text-primary"></i>
            <i className="bx bxs-star text-primary"></i>
            <i className="bx bxs-star text-primary"></i>
            <i className="bx bxs-star text-primary"></i>
            <i className="bx bx-star text-text-light"></i>
            <span className="text-text-light text-xs ml-1">(4.2)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
