'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import RecipeCard from '@/components/RecipeCard';

export default function Recipes() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    { id: 'all', name: 'Todas', icon: 'bx-grid-alt' },
    { id: 'breakfast', name: 'Café da Manhã', icon: 'bx-coffee' },
    { id: 'lunch', name: 'Almoço', icon: 'bx-sun' },
    { id: 'dinner', name: 'Jantar', icon: 'bx-moon' },
    { id: 'snack', name: 'Lanche', icon: 'bx-cookie' },
    { id: 'dessert', name: 'Sobremesa', icon: 'bx-cake' },
  ];

  const recipes = [
    {
      id: '1',
      title: 'Panqueca de Aveia com Banana',
      description: 'Deliciosa panqueca proteica perfeita para o café da manhã',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      prepTime: 15,
      difficulty: 'easy' as const,
      isPremium: false,
      hasVideo: true,
      category: 'breakfast',
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
      category: 'breakfast',
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
      category: 'lunch',
    },
    {
      id: '4',
      title: 'Salmão Grelhado com Quinoa',
      description: 'Prato completo rico em proteínas e ômega-3',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      prepTime: 25,
      difficulty: 'medium' as const,
      isPremium: true,
      hasVideo: true,
      category: 'dinner',
    },
    {
      id: '5',
      title: 'Barrinha de Cereal Caseira',
      description: 'Barrinha energética sem açúcar refinado',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      prepTime: 30,
      difficulty: 'easy' as const,
      isPremium: false,
      hasVideo: false,
      category: 'snack',
    },
    {
      id: '6',
      title: 'Mousse de Chocolate Fit',
      description: 'Sobremesa cremosa sem açúcar e sem lactose',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      prepTime: 15,
      difficulty: 'easy' as const,
      isPremium: true,
      hasVideo: true,
      category: 'dessert',
    },
    {
      id: '7',
      title: 'Omelete de Espinafre',
      description: 'Omelete nutritivo com folhas verdes e queijo',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      prepTime: 12,
      difficulty: 'easy' as const,
      isPremium: false,
      hasVideo: false,
      category: 'breakfast',
    },
    {
      id: '8',
      title: 'Risotto de Cogumelos',
      description: 'Risotto cremoso com cogumelos frescos',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      prepTime: 35,
      difficulty: 'hard' as const,
      isPremium: true,
      hasVideo: true,
      category: 'dinner',
    },
  ];

  const filteredRecipes = selectedCategory === 'all' 
    ? recipes 
    : recipes.filter(recipe => recipe.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="hero-gradient py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-heading text-4xl md:text-6xl font-bold text-text mb-4">
                Receitas <span className="text-primary">Deliciosas</span>
              </h1>
              <p className="text-xl text-text-light max-w-2xl mx-auto mb-8">
                Descubra mais de 50 receitas saudáveis e práticas para transformar sua alimentação
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto relative">
                <input
                  type="text"
                  placeholder="Buscar receitas..."
                  className="w-full bg-card-bg border border-card-border rounded-full px-6 py-4 pr-12 text-text placeholder-text-light focus:outline-none focus:border-primary transition-colors"
                />
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-light hover:text-primary transition-colors">
                  <i className="bx bx-search text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-8 bg-background-alt">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-primary text-background'
                      : 'bg-card-bg text-text-light hover:bg-primary/20 hover:text-primary'
                  }`}
                >
                  <i className={`bx ${category.icon}`}></i>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recipes Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-3xl font-bold text-text">
                {selectedCategory === 'all' ? 'Todas as Receitas' : categories.find(c => c.id === selectedCategory)?.name}
                <span className="text-primary ml-2">({filteredRecipes.length})</span>
              </h2>
              
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-text-light hover:text-primary transition-colors">
                  <i className="bx bx-filter text-lg"></i>
                  <span>Filtros</span>
                </button>
                <button className="flex items-center gap-2 text-text-light hover:text-primary transition-colors">
                  <i className="bx bx-sort text-lg"></i>
                  <span>Ordenar</span>
                </button>
              </div>
            </div>

            <div className="recipes-grid">
              {filteredRecipes.map((recipe, index) => (
                <div key={recipe.id} className={`animate-on-scroll ${isVisible ? 'visible' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="btn-secondary">
                <i className="bx bx-plus mr-2"></i>
                Carregar Mais Receitas
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-background-alt">
          <div className="container mx-auto px-4">
            <div className="bg-card-bg border border-card-border rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
              <h3 className="font-heading text-3xl font-bold text-text mb-4">
                Quer Acesso a Todas as Receitas?
              </h3>
              <p className="text-text-light mb-8 text-lg">
                Desbloqueie receitas exclusivas, vídeos tutoriais e muito mais com nossa assinatura premium
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary">
                  <i className="bx bx-crown mr-2"></i>
                  Assinar Premium
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
