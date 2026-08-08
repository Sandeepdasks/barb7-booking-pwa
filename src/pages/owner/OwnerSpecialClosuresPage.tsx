import { useNavigate } from 'react-router-dom';
import { useOwnerAuth } from '@/contexts/OwnerAuthContext';
import { useSpecialClosures } from '@/hooks/owner/useSpecialClosures';
import { OwnerPageShell } from '@/components/owner/layout/OwnerPageShell';
import { OwnerHeader } from '@/components/owner/layout/OwnerHeader';
import { SpecialClosuresList } from '@/components/owner/settings/SpecialClosuresList';
import { OwnerSpinner } from '@/components/owner/ui';
import type { SpecialClosure } from '@/types/owner';

export function OwnerSpecialClosuresPage() {
  const navigate = useNavigate();
  const { ownerProfile } = useOwnerAuth();
  const { closures, loading, remove } = useSpecialClosures(ownerProfile?.salonId);

  async function handleDelete(closure: SpecialClosure) {
    if (confirm(`Remove closure "${closure.label}"?`)) {
      await remove(closure.closureId);
    }
  }

  return (
    <OwnerPageShell
      header={<OwnerHeader title="Special Closures" onBack={() => navigate('/owner/settings')} />}
    >
      {loading ? (
        <OwnerSpinner />
      ) : (
        <SpecialClosuresList
          closures={closures}
          onAdd={() => navigate('/owner/settings/special-closures/new')}
          onEdit={(closure) => navigate(`/owner/settings/special-closures/${closure.closureId}/edit`)}
          onDelete={handleDelete}
        />
      )}
    </OwnerPageShell>
  );
}
