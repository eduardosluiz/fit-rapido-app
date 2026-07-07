'use client';

import React, { useState, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChevronLeft, Play } from 'lucide-react';

interface MediaSelectorPopoverProps {
  children: React.ReactNode;
  bibliotecaExercicios: any[];
  onSelect: (video: any) => void;
  onClear?: () => void;
  selectedValue?: string;
  compareKey?: 'video_url' | 'id';
  title?: string;
}

export function MediaSelectorPopover({ 
  children, 
  bibliotecaExercicios, 
  onSelect, 
  onClear,
  selectedValue, 
  compareKey = 'video_url',
  title = 'Mídias Privadas'
}: MediaSelectorPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Derivar categorias da biblioteca
  const categories = useMemo(() => {
    const cats = new Set<string>();
    bibliotecaExercicios.forEach(ex => {
      cats.add(ex.categoria || 'Geral');
    });
    return Array.from(cats).sort();
  }, [bibliotecaExercicios]);

  // Filtrar itens de acordo com busca ou categoria selecionada
  const filteredItems = useMemo(() => {
    let items = bibliotecaExercicios;
    
    if (searchTerm) {
      return items.filter(ex => ex.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    if (selectedCategory) {
      return items.filter(ex => (ex.categoria || 'Geral') === selectedCategory);
    }
    
    return [];
  }, [bibliotecaExercicios, searchTerm, selectedCategory]);

  return (
    <Popover 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Resetar estados ao fechar
          setTimeout(() => {
            setSearchTerm('');
            setSelectedCategory(null);
          }, 200);
        }
      }}
    >
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] shadow-2xl z-[200]">
        <div className="p-3 border-b border-gray-100 dark:border-[#1a1a1a] space-y-3">
          <div className="flex items-center gap-2">
            {selectedCategory && !searchTerm && (
              <button 
                onClick={() => setSelectedCategory(null)} 
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#111] rounded text-gray-500 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#c8921a]">
              {selectedCategory && !searchTerm ? `Categoria: ${selectedCategory}` : title}
            </p>
          </div>
          <input 
            type="text" 
            placeholder="Filtrar exercícios..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full h-8 px-3 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-[#333] rounded text-[10px] focus:border-[#c8921a] outline-none" 
            autoFocus 
          />
        </div>
        
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
          {searchTerm || selectedCategory ? (
            <div className="space-y-1">
              {onClear && selectedValue && (
                <button 
                  type="button" 
                  className="w-full p-2 text-left text-[10px] uppercase font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded mb-1 transition-colors"
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                >
                  Limpar Seleção
                </button>
              )}
              
              {filteredItems.length === 0 && (
                <p className="p-3 text-center text-xs text-gray-500">Nenhuma mídia encontrada.</p>
              )}
              
              {filteredItems.map((libEx: any) => (
                <button 
                  key={libEx.id} 
                  type="button" 
                  className={`w-full p-2.5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#111] rounded transition-all text-left ${selectedValue === libEx[compareKey] ? 'bg-[#c8921a]/10 border-l-2 border-[#c8921a]' : ''}`} 
                  onClick={() => {
                    onSelect(libEx);
                    setIsOpen(false);
                  }}
                >
                  <div className="w-10 h-10 rounded bg-black overflow-hidden flex-shrink-0 relative border border-gray-200">
                    <video src={`${libEx.video_url}#t=0.5`} className="w-full h-full object-cover opacity-60" muted preload="none" />
                    <Play className="absolute inset-0 m-auto text-white opacity-40" size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200 uppercase truncate">{libEx.nome}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-tighter">{libEx.categoria || 'Geral'}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {categories.map(cat => {
                const count = bibliotecaExercicios.filter(ex => (ex.categoria || 'Geral') === cat).length;
                return (
                  <button 
                    key={cat} 
                    type="button" 
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#111] rounded-lg transition-all text-left group border border-transparent hover:border-gray-200 dark:hover:border-[#333]"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{cat}</span>
                    <span className="text-[10px] text-gray-500 group-hover:text-[#c8921a] font-medium transition-colors bg-gray-100 dark:bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
