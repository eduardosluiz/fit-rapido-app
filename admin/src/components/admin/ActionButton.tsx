'use client';

import { cn } from '@/lib/utils';

interface ActionButtonProps {
  variant?: 'edit' | 'delete' | 'view' | 'warning' | 'success' | 'custom';
  onClick: () => void;
  icon?: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  title?: string;
}

export function ActionButton({ 
  variant = 'edit', 
  onClick, 
  icon, 
  label,
  className,
  size = 'default',
  title
}: ActionButtonProps) {
  const variants = {
    edit: {
      className: "bg-white dark:bg-[#252525] border-gray-300 dark:border-[#444] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#c8921a] shadow-sm hover:shadow-md [&_i]:text-gray-700 dark:[&_i]:text-gray-300",
      defaultIcon: "bx-edit",
      defaultLabel: "Editar"
    },
    delete: {
      className: "bg-white dark:bg-[#252525] text-red-600 dark:text-red-400 border-red-600 dark:border-red-500 hover:border-red-700 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm hover:shadow-md [&_i]:text-red-600 dark:[&_i]:text-red-400",
      defaultIcon: "bx-trash",
      defaultLabel: "Excluir"
    },
    view: {
      className: "bg-blue-600 hover:bg-blue-700 text-white border-blue-700 hover:border-blue-800 shadow-sm hover:shadow-md [&_i]:text-white",
      defaultIcon: "bx-show",
      defaultLabel: "Ver"
    },
    warning: {
      className: "bg-[#c8921a] hover:bg-[#b88217] text-white border-[#b88217] hover:border-[#a67214] shadow-sm hover:shadow-md [&_i]:text-white",
      defaultIcon: "bx-block",
      defaultLabel: "Desativar"
    },
    success: {
      className: "bg-green-600 hover:bg-green-700 text-white border-green-700 hover:border-green-800 shadow-sm hover:shadow-md [&_i]:text-white",
      defaultIcon: "bx-check",
      defaultLabel: "Ativar"
    },
    custom: {
      className: "",
      defaultIcon: "",
      defaultLabel: ""
    }
  };

  const config = variants[variant as keyof typeof variants] || variants.edit; // Fallback para 'edit' se variant inválido
  const displayIcon = icon || config.defaultIcon;
  const displayLabel = label || config.defaultLabel;

  const tooltipTitle = title || (variant === 'edit' ? 'Editar' : variant === 'delete' ? 'Excluir' : displayLabel);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center font-semibold transition-all rounded-lg border",
        size === 'sm' ? 'px-2 py-1.5 text-xs w-8 h-8' : size === 'lg' ? 'px-6 py-3 text-base gap-2' : 'px-4 py-2.5 text-sm gap-1.5',
        variant !== 'custom' && config?.className,
        className
      )}
      aria-label={displayLabel || variant}
      title={tooltipTitle}
    >
      {displayIcon && <i className={cn("bx", displayIcon, size === 'sm' ? "text-base" : size === 'lg' ? "text-lg" : "text-base")}></i>}
      {displayLabel && size !== 'sm' && <span>{displayLabel}</span>}
    </button>
  );
}

