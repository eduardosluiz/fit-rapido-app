'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import RecipeCard from '@/components/RecipeCard';
import WorkoutCard from '@/components/WorkoutCard';

export default function Dashboard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Dados mockados para demonstração
  const stats = [
    { label: 'Receitas Favoritas', value: '24', icon: 'bx-heart', color: 'text-red-400' },
    { label: 'Treinos Concluídos', value: '12', icon: 'bx-check-circle', color: 'text-green-400' },
    { label: 'Dias de Streak', value: '7', icon: 'bx-flame', color: 'text-orange-400' },
    { label: 'Calorias Queimadas', value: '1,240', icon: 'bx-dumbbell', color: 'text-primary' },
  ];

  const recentRecipes = [
    {
      id: '1',
      title: 'Panqueca de Aveia com Banana',
      description: 'Deliciosa panqueca proteica perfeita para o café da manhã',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      prepTime: 15,
      difficulty: 'easy' as const,
      isPremium: false,
      hasVideo: true,
    },
    {
      id: '2',
      title: 'Smoothie Bowl de Açaí',
      description: 'Bowl energético com frutas e granola caseira',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop',
      prepTime: 10,
      difficulty: 'easy' as const,
      isPremium: true,
      hasVideo: true,
    },
    {
      id: '3',
      title: 'Wrap de Frango Grelhado',
      description: 'Wrap proteico com vegetais frescos e molho especial',
      image: 'https://images.unsplash.com/photo-1565299585323-38174c4a7a4a?w=400&h=300&fit=crop',
      prepTime: 20,
      difficulty: 'medium' as const,
      isPremium: false,
      hasVideo: false,
    },
  ];

  const recentWorkouts = [
    {
      id: '1',
      title: 'HIIT Cardio Intenso',
      description: 'Treino de alta intensidade para queimar calorias',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      duration: 30,
      difficulty: 'intermediate' as const,
      category: 'Cardio',
      isPremium: true,
      trainer: 'Daiane Pohlmann',
    },
    {
      id: '2',
      title: 'Yoga Matinal',
      description: 'Sequência suave para começar o dia com energia',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      duration: 25,
      difficulty: 'beginner' as const,
      category: 'Yoga',
      isPremium: false,
      trainer: 'Maria Silva',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="hero-gradient py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-heading text-4xl md:text-6xl font-bold text-text mb-4">
                Bem-vinda, <span className="text-primary">Maria!</span>
              </h1>
              <p className="text-xl text-text-light max-w-2xl mx-auto">
                Pronta para mais um dia de receitas deliciosas e treinos incríveis?
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className={`stat-card animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`text-3xl mb-2 ${stat.color}`}>
                    <i className={`bx ${stat.icon}`}></i>
                  </div>
                  <div className="text-2xl font-bold text-text mb-1">{stat.value}</div>
                  <div className="text-sm text-text-light">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Recipes */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-3xl font-bold text-text">
                Receitas Recentes
              </h2>
              <button className="text-primary hover:text-yellow-400 transition-colors">
                Ver todas <i className="bx bx-right-arrow-alt ml-1"></i>
              </button>
            </div>

            <div className="recipes-grid">
              {recentRecipes.map((recipe, index) => (
                <div key={recipe.id} className={`animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ animationDelay: `${(index + 4) * 100}ms` }}>
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Workouts */}
        <section className="py-16 bg-background-alt">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-3xl font-bold text-text">
                Treinos de Hoje
              </h2>
              <button className="text-primary hover:text-yellow-400 transition-colors">
                Ver todos <i className="bx bx-right-arrow-alt ml-1"></i>
              </button>
            </div>

            <div className="workouts-grid">
              {recentWorkouts.map((workout, index) => (
                <div key={workout.id} className={`animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ animationDelay: `${(index + 7) * 100}ms` }}>
                  <WorkoutCard workout={workout} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-text text-center mb-12">
              Ações Rápidas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-card-bg border border-card-border rounded-2xl p-8 text-center hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="bx bx-search text-3xl text-primary"></i>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">Buscar Receitas</h3>
                <p className="text-text-light mb-6">Encontre receitas por ingredientes, categoria ou dificuldade</p>
                <button className="btn-primary w-full">Buscar</button>
              </div>

              <div className="bg-card-bg border border-card-border rounded-2xl p-8 text-center hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="bx bx-calendar text-3xl text-primary"></i>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">Agendar Treino</h3>
                <p className="text-text-light mb-6">Marque uma sessão com nossa personal trainer</p>
                <button className="btn-primary w-full">Agendar</button>
              </div>

              <div className="bg-card-bg border border-card-border rounded-2xl p-8 text-center hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="bx bx-shopping-bag text-3xl text-primary"></i>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">Lista de Compras</h3>
                <p className="text-text-light mb-6">Gere sua lista baseada nas receitas favoritas</p>
                <button className="btn-primary w-full">Gerar Lista</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
