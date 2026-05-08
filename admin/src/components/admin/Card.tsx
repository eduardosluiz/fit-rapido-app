'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseClasses = 'bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200 shadow-sm';
  const hoverClasses = hover ? 'hover:border-[#c8921a] hover:shadow-md cursor-pointer' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';

  // Removendo hover das props para evitar erro do React
  // (hover é usado apenas para aplicar classes CSS, não como atributo HTML)
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

