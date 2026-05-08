'use client';

import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'bg-blue-500/10 text-blue-600',
  href,
}: StatCardProps) {
  const content = (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0`}>
        <i className={`bx ${icon} text-xl`}></i>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#c8921a] hover:shadow-md transition-all duration-200">
          {content}
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {content}
    </div>
  );
}

