'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'magic';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
}

export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
  type: typeProp,
  form,
}: ButtonProps) {
  // Se não tem children (texto), ajusta para botão apenas com ícone
  const isIconOnly = !children;
  const baseClasses = cn(
    'admin-btn-modern inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed relative',
    variant === 'magic' ? 'rounded-lg' : 'rounded-xl',
    isIconOnly ? '' : variant === 'magic' ? 'gap-1.5' : 'gap-2'
  );
  
  const variantClasses = {
    primary: 'admin-btn-modern-primary bg-gradient-to-r from-[#c8921a] to-[#d4a020] hover:from-[#b88217] hover:to-[#c8921a] text-white shadow-lg hover:shadow-xl hover:shadow-[#c8921a]/25 border border-[#b88217]/30 hover:border-[#c8921a]/50 backdrop-blur-md bg-opacity-95',
    magic: 'font-medium rounded-lg transition-all duration-200',
    secondary: 'admin-btn-modern-secondary bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-[#1a1a1a]',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold border-2 border-red-700 shadow-lg',
    outline: 'admin-btn-back bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1a1a1a] shadow-lg hover:shadow-xl backdrop-blur-md',
  };

  const sizeClasses = {
    sm: variant === 'magic' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
    md: variant === 'magic' ? 'px-4 py-2 text-sm' : 'px-5 py-2.5 text-sm',
    lg: variant === 'magic' ? 'px-5 py-2.5 text-base' : 'px-6 py-3 text-base',
  };

  const iconOnlyClasses = isIconOnly ? 'px-3 py-2 aspect-square' : '';

  const classes = cn(
    baseClasses, 
    variantClasses[variant], 
    sizeClasses[size], 
    iconOnlyClasses, 
    className
  );

  const buttonContent = (
    <span className={cn("flex items-center", isIconOnly ? "justify-center" : "gap-2")}>
      {icon && <i className={cn(`bx ${icon} text-base`)}></i>}
      {children && <span>{children}</span>}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={classes} style={{ textDecoration: 'none' }}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button 
      type={typeProp ?? (onClick ? 'button' : 'submit')} 
      onClick={onClick} 
      form={form}
      className={classes} 
      disabled={disabled}
    >
      {buttonContent}
    </button>
  );
}

