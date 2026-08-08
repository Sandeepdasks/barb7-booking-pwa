import { useNavigate } from 'react-router-dom';
import { useOwnerAuth } from '@/contexts/OwnerAuthContext';
import { useWorkingHours } from '@/hooks/owner/useWorkingHours';
import { OwnerPageShell } from '@/components/owner/layout/OwnerPageShell';
import { OwnerHeader } from '@/components/owner/layout/OwnerHeader';
import { WorkingHoursForm } from '@/components/owner/settings/WorkingHoursForm';
import { OwnerSpinner } from '@/components/owner/ui';

export function OwnerWorkingHoursPage() {
  const navigate = useNavigate();
  const { ownerProfile } = useOwnerAuth();
  const { hours, loading, saving, save } = useWorkingHours(ownerProfile?.salonId);

  return (
    <OwnerPageShell header={<OwnerHeader title="Working Hours" onBack={() => navigate('/owner/settings')} />}>
      {loading || !hours ? <OwnerSpinner /> : <WorkingHoursForm hours={hours} saving={saving} onSave={save} />}
    </OwnerPageShell>
  );
}
