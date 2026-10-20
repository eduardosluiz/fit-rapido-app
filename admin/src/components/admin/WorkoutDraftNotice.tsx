interface WorkoutDraftNoticeProps {
  revision: number;
  published: boolean;
}

export function WorkoutDraftNotice({ revision, published }: WorkoutDraftNoticeProps) {
  return (
    <div className="rounded-lg border border-amber-400/30 p-3 text-xs leading-relaxed text-gray-700 dark:text-gray-200 space-y-1">
      <div>{revision ? 'Rascunho salvo · edições não publicadas.' : published ? 'Publicado · novas edições serão salvas como rascunho.' : 'Novo rascunho · ainda não aparece no aplicativo.'}</div>
      <div><strong>Salvar rascunho:</strong> guarda seu trabalho sem alterar o aplicativo.</div>
      <div><strong>Publicar edições:</strong> atualiza o conteúdo no aplicativo.</div>
    </div>
  );
}
