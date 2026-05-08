'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import WorkoutCard from '@/components/WorkoutCard';

export default function Workouts() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    { id: 'all', name: 'Todos', icon: 'bx-grid-alt' },
    { id: 'upper', name: 'Superiores', icon: 'bx-dumbbell' },
    { id: 'lower', name: 'Inferiores', icon: 'bx-run' },
    { id: 'core', name: 'Core', icon: 'bx-body' },
    { id: 'full', name: 'Corpo Todo', icon: 'bx-user' },
  ];

  const workouts = [
    {
      id: '1',
      title: 'Treino de Peito e Tríceps',
      description: 'Exercícios focados em desenvolvimento do peitoral e tríceps para ganho de massa muscular',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      duration: 45,
      difficulty: 'intermediate' as const,
      category: 'Superiores',
      isPremium: true,
      trainer: 'Daiane Pohlmann',
    },
    {
      id: '2',
      title: 'Treino de Costas e Bíceps',
      description: 'Desenvolvimento da musculatura das costas e bíceps com exercícios compostos',
      image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop',
      duration: 50,
      difficulty: 'intermediate' as const,
      category: 'Superiores',
      isPremium: true,
      trainer: 'Daiane Pohlmann',
    },
    {
      id: '3',
      title: 'Treino de Pernas Completo',
      description: 'Exercícios para quadríceps, glúteos e panturrilhas com foco em hipertrofia',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      duration: 60,
      difficulty: 'advanced' as const,
      category: 'Inferiores',
      isPremium: true,
      trainer: 'Daiane Pohlmann',
    },
    {
      id: '4',
      title: 'Treino de Core e Abdominais',
      description: 'Fortalecimento do core com exercícios funcionais e abdominais variados',
      image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop',
      duration: 30,
      difficulty: 'beginner' as const,
      category: 'Core',
      isPremium: false,
      trainer: 'Daiane Pohlmann',
    },
    {
      id: '5',
      title: 'Treino Full Body',
      description: 'Treino completo para todo o corpo, ideal para iniciantes em musculação',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      duration: 45,
      difficulty: 'beginner' as const,
      category: 'Corpo Todo',
      isPremium: false,
      trainer: 'Daiane Pohlmann',
    },
    {
      id: '6',
      title: 'Treino de Ombros e Trapézio',
      description: 'Desenvolvimento dos deltoides e trapézio para ombros largos e definidos',
      image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop',
      duration: 40,
      difficulty: 'intermediate' as const,
      category: 'Superiores',
      isPremium: true,
      trainer: 'Daiane Pohlmann',
    },
  ];

  const filteredWorkouts = selectedCategory === 'all' 
    ? workouts 
    : workouts.filter(workout => {
        const categoryMap: Record<string, string> = {
          'upper': 'Superiores',
          'lower': 'Inferiores', 
          'core': 'Core',
          'full': 'Corpo Todo'
        };
        return workout.category === categoryMap[selectedCategory];
      });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-14 md:pt-16">
        {/* Hero Section */}
        <section className="py-8 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4">
                Treinos de <span className="text-green-500">Musculação</span>
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8">
                Transforme seu corpo com treinos de musculação exclusivos criados pela Daiane Pohlmann
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto relative">
                <input
                  type="text"
                  placeholder="Buscar treinos de musculação..."
                  className="w-full bg-white border border-gray-200 rounded-full px-4 md:px-6 py-3 md:py-4 pr-10 md:pr-12 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors text-sm md:text-base"
                />
                <button className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-500 transition-colors">
                  <i className="bx bx-search text-lg md:text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-6 md:py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 text-sm md:text-base ${
                    selectedCategory === category.id
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-green-100 hover:text-green-600 border border-gray-200'
                  }`}
                >
                  <i className={`bx ${category.icon}`}></i>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Workouts Grid */}
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800">
                {selectedCategory === 'all' ? 'Todos os Treinos' : categories.find(c => c.id === selectedCategory)?.name}
                <span className="text-green-500 ml-2">({filteredWorkouts.length})</span>
              </h2>
              
              <div className="flex items-center gap-3 md:gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors text-sm md:text-base">
                  <i className="bx bx-filter text-base md:text-lg"></i>
                  <span>Filtros</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors text-sm md:text-base">
                  <i className="bx bx-sort text-base md:text-lg"></i>
                  <span>Ordenar</span>
                </button>
              </div>
            </div>

            <div className="workouts-grid">
              {filteredWorkouts.map((workout, index) => (
                <div key={workout.id} className={`animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
                  <WorkoutCard workout={workout} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8 md:mt-12">
              <button className="btn-secondary">
                <i className="bx bx-plus mr-2"></i>
                Carregar Mais Treinos
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-12 text-center max-w-4xl mx-auto">
              <h3 className="text-xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">
                Quer Treinos de Musculação Personalizados?
              </h3>
              <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg">
                Agende uma consulta com a Daiane Pohlmann para criar um plano de treino de musculação exclusivo para você
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button className="btn-primary">
                  <i className="bx bx-calendar mr-2"></i>
                  Agendar Consulta
                </button>
                <button className="btn-secondary">
                  <i className="bx bx-info-circle mr-2"></i>
                  Saiba Mais
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}