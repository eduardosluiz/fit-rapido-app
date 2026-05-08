'use client';

interface WorkoutCardProps {
  workout: {
    id: string;
    title: string;
    description: string;
    image: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    isPremium: boolean;
    trainer: string;
  };
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  const difficultyLabels = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado'
  };

  const difficultyColors = {
    beginner: 'text-green-500',
    intermediate: 'text-yellow-500',
    advanced: 'text-red-500'
  };

  return (
    <div className="content-card animate-on-scroll">
      <div className="recipe-image relative" style={{ backgroundImage: `url(${workout.image})` }}>
        <div className="recipe-overlay"></div>
        
        {/* Premium Badge */}
        {workout.isPremium && (
          <div className="premium-badge">
            <i className="bx bx-crown mr-1"></i>
            Premium
          </div>
        )}

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-green-500/90 hover:bg-green-500 text-white rounded-full p-3 md:p-4 transition-all duration-300 hover:scale-110">
            <i className="bx bx-play text-xl md:text-2xl"></i>
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-semibold">
          {workout.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {workout.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {workout.description}
        </p>

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="flex items-center text-gray-500">
              <i className="bx bx-time mr-1"></i>
              {workout.duration}min
            </span>
            <span className={`flex items-center ${difficultyColors[workout.difficulty]}`}>
              <i className="bx bx-dumbbell mr-1"></i>
              {difficultyLabels[workout.difficulty]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <i className="bx bx-user mr-2"></i>
            <span>{workout.trainer}</span>
          </div>
          
          <button className="text-green-500 hover:text-green-600 transition-colors">
            <i className="bx bx-heart text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
