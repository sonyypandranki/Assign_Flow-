import { Assignment, StudentSubmission } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from './StatusChip';
import { ProgressBar } from './ProgressBar';
import { Calendar, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

interface AssignmentCardProps {
  assignment: Assignment;
  submission?: StudentSubmission;
  onSubmit: (assignmentId: string) => void;
}

export const AssignmentCard = ({ assignment, submission, onSubmit }: AssignmentCardProps) => {
  const isSubmitted = submission?.status === 'submitted';
  const progress = isSubmitted ? 100 : 0;
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date() && !isSubmitted;
  const [open, setOpen] = useState(false);

  return (
    <Card className="p-6 card-hover">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{assignment.title}</h3>
          <p className="text-muted-foreground text-sm mb-3">{assignment.description}</p>
        </div>
        <StatusChip status={submission?.status || 'not-submitted'} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className={isOverdue ? 'text-destructive font-medium' : 'text-foreground'}>
            Due {formatDistanceToNow(dueDate, { addSuffix: true })}
          </span>
        </div>

        {isSubmitted && submission?.submittedAt && (
          <div className="flex items-center gap-2 text-xs text-success">
            <CheckCircle2 className="w-4 h-4" />
            Acknowledged {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
          </div>
        )}

        <ProgressBar progress={progress} showLabel />

        <div className="flex gap-2 pt-2 justify-end">
          {!isSubmitted && (
            <Button size="sm" onClick={() => onSubmit(assignment.id)}>
              Mark as Submitted
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Info className="w-4 h-4 mr-2" />
            View Assignment
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{assignment.title}</DialogTitle>
            <DialogDescription>
              Due {formatDistanceToNow(dueDate, { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-foreground">{assignment.description}</p>
            {assignment.driveLink && (
              <a
                className="inline-flex items-center text-primary underline text-sm"
                href={assignment.driveLink}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Open resource/drive link
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
