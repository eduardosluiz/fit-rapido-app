'use client';
import Link from 'next/link';
import { BaseModal } from './BaseModal';
interface ModalidadesModalProps { open: boolean; onOpenChange: (open: boolean) => void; onModalidadeChange?: () => void; }
export function ModalidadesModal({ open, onOpenChange }: ModalidadesModalProps) {
  return <BaseModal open={open} onOpenChange={onOpenChange} title="Modalidades" description="Salve rascunhos e publique quando estiver pronto.">
    <div className="p-6"><Link href="/admin/modalidades" className="inline-block rounded-lg bg-amber-600 px-4 py-3 text-white">Abrir editor de modalidades</Link></div>
  </BaseModal>;
}
