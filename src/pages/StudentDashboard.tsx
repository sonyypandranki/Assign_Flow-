import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AssignmentCard } from '@/components/AssignmentCard';
import { SubmissionModal } from '@/components/SubmissionModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  drive_link: string;
  created_at: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: string;
  submitted_at: string | null;
}

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'not-submitted'>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      // Load submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', user!.id);

      if (submissionsError) throw submissionsError;

      setAssignments(assignmentsData || []);
      setSubmissions(submissionsData || []);
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setSelectedAssignment(assignment);
      setIsModalOpen(true);
    }
  };

  const handleConfirmSubmission = async (file: File | null) => {
    if (!selectedAssignment || !user) return;

    try {
      let fileUrl: string | null = null;
      if (file) {
        const path = `${user.id}/${selectedAssignment.id}.pdf`;
        const { data: uploadRes, error: uploadErr } = await supabase.storage
          .from('submissions')
          .upload(path, file, { contentType: 'application/pdf', upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: publicUrl } = supabase.storage.from('submissions').getPublicUrl(uploadRes.path);
        fileUrl = publicUrl.publicUrl;
      }

      const { error } = await supabase
        .from('submissions')
        .upsert({
          assignment_id: selectedAssignment.id,
          student_id: user.id,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          file_url: fileUrl,
        }, {
          onConflict: 'assignment_id,student_id'
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Assignment submitted successfully',
      });

      loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error submitting assignment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const totalCount = assignments.length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Assignments</h1>
          <p className="text-muted-foreground">
            Track and submit your assignments
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Input
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="not-submitted">Not submitted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">Total Assignments</div>
            <div className="text-3xl font-bold">{totalCount}</div>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">Submitted</div>
            <div className="text-3xl font-bold text-success">{submittedCount}</div>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-3xl font-bold text-warning">{totalCount - submittedCount}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments
            .filter((a) => {
              const q = searchQuery.trim().toLowerCase();
              if (!q) return true;
              return (
                a.title.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q)
              );
            })
            .map((assignment) => {
            const submission = submissions.find(s => s.assignment_id === assignment.id);
              if (statusFilter !== 'all') {
                const status = (submission?.status || 'not-submitted') as 'submitted' | 'not-submitted';
                if (statusFilter !== status) return null;
              }
            return (
              <AssignmentCard
                key={assignment.id}
                assignment={{
                  id: assignment.id,
                  title: assignment.title,
                  description: assignment.description,
                  dueDate: assignment.due_date,
                  driveLink: assignment.drive_link,
                  createdAt: assignment.created_at,
                }}
                submission={submission ? {
                  assignmentId: submission.assignment_id,
                  studentId: submission.student_id,
                  status: submission.status as 'not-submitted' | 'submitted',
                  submittedAt: submission.submitted_at,
                } : undefined}
                onSubmit={handleSubmitClick}
              />
            );
            })}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No assignments available yet.</p>
          </div>
        )}
      </div>

      {selectedAssignment && (
        <SubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSubmission}
          assignmentTitle={selectedAssignment.title}
        />
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
