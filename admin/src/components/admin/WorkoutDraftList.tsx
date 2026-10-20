'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export function WorkoutDraftList() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api.getWorkoutDrafts('treino').then(setDrafts).catch(e => setError(e.message));
  }, []);
  if (error) return <p role="alert" className="text-sm text-red-600">Não foi possível carregar os rascunhos: {error}</p>;
  if (!drafts.length) return null;
  return <section className="rounded-xl border border-amber-400/30 p-4 space-y-3">
    <h2 className="font-semibold">Rascunhos e edições pendentes</h2>
    <p className="text-sm text-gray-500">Estas alterações ainda não aparecem no aplicativo.</p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {drafts.map(d => <Link key={d.id} href={`/admin/treinos/${d.id}`} className="rounded-lg border border-gray-300 dark:border-gray-700 p-3 hover:border-amber-500">
        <strong className="block break-words">{d.title || 'Sem título'}</strong>
        <span className="text-xs text-amber-700 dark:text-amber-300">{d.published ? 'Edições não publicadas' : 'Rascunho novo'} · Continuar edição</span>
      </Link>)}
    </div>
  </section>;
}
