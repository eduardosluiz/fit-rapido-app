'use client';

import Link from 'next/link';
import { Button } from './Button';
import { getMediaUrl } from '@/lib/media';
import '../../app/admin/item-card.css';

interface ItemCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isPremium?: boolean;
  status?: 'active' | 'inactive';
  badges?: Array<{ label: string; color: string }>;
  metadata?: Array<{ icon: string; text: string }>;
  editHref: string;
  onDelete: () => void;
}

export function ItemCard({
  id,
  title,
  description,
  imageUrl,
  isPremium,
  status,
  badges = [],
  metadata = [],
  editHref,
  onDelete,
}: ItemCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden item-card"
    >
      {imageUrl && (
        <div 
          className="w-full overflow-hidden item-card-image-container"
          style={{ 
            height: '180px',
            maxHeight: '180px',
            minHeight: '180px',
            width: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a'
          }}
        >
          <img
            src={getMediaUrl(imageUrl)}
            alt={title}
            className="w-full h-full object-cover"
            style={{
              width: '100%',
              height: '180px',
              maxHeight: '180px',
              minHeight: '180px',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              flexShrink: 0
            }}
          />
        </div>
      )}
      <div className="item-card-content" style={{ padding: '16px' }}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2 line-clamp-2 item-card-title" style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
            {title.length > 16 ? `${title.substring(0, 16)}...` : title}
          </h3>
          {isPremium && (
            <span className="bg-[#c8921a] text-white px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap flex-shrink-0" style={{ fontSize: '10px' }}>
              PREMIUM
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 item-card-description" style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '12px', color: '#6b7280' }}>
            {description}
          </p>
        )}

        {metadata.length > 0 && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 item-card-metadata" style={{ fontSize: '10px' }}>
            {metadata.map((meta, index) => (
              <span key={index} className="flex items-center gap-0.5">
                <i className={`bx ${meta.icon}`} style={{ fontSize: '10px' }}></i>
                {meta.text}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {badges.map((badge, index) => (
            <span
              key={index}
              className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${badge.color} item-card-badge`}
              style={{ fontSize: '10px', padding: '4px 6px' }}
            >
              {badge.label}
            </span>
          ))}
          {status && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-medium item-card-badge ${
                status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
              style={{ fontSize: '10px', padding: '4px 6px' }}
            >
              {status === 'active' ? 'Ativa' : 'Inativa'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-gray-200 item-card-actions" style={{ paddingTop: '12px', fontSize: '14px', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href={editHref}
            className="flex-1 text-center font-semibold text-gray-700 hover:text-[#c8921a] transition-colors flex items-center justify-center gap-1.5"
            style={{ fontSize: '14px', fontWeight: '600' }}
          >
            <i className="bx bx-edit" style={{ fontSize: '16px' }}></i>
            Editar
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-700 transition-colors p-1 cursor-pointer"
            style={{ fontSize: '14px', padding: '4px', cursor: 'pointer' }}
            title="Excluir"
            type="button"
          >
            <i className="bx bx-trash" style={{ fontSize: '18px' }}></i>
          </button>
        </div>
      </div>
    </div>
  );
}

