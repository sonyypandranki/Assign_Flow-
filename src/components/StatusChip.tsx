import { cn } from '@/lib/utils';
import { AssignmentStatus } from '@/types';
import { CheckCircle2, Clock } from 'lucide-react';

interface StatusChipProps {
  status: AssignmentStatus;
  className?: string;
}

export const StatusChip = ({ status, className }: StatusChipProps) => {
  const isSubmitted = status === 'submitted';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
        isSubmitted
          ? 'bg-success/10 text-success'
          : 'bg-warning/10 text-warning',
        className
      )}
    >
      {isSubmitted ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span>Submitted</span>
        </>
      ) : (
        <>
          <Clock className="w-4 h-4" />
          <span>Not Submitted</span>
        </>
      )}
    </div>
  );
};
