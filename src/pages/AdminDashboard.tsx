import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreateAssignmentModal } from '@/components/CreateAssignmentModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Users, CheckCircle } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  drive_link: string;
}

const AdminDashboard = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Load submissions count
      const { count: submissionsCount, error: submissionsError } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');

      if (submissionsError) throw submissionsError;

      // Load students count (users with student role)
      const { count: studentCount, error: studentsError } = await supabase
        .from('user_roles')
        .select('user_id', { count: 'exact', head: true })
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      setAssignments(assignmentsData || []);
      setSubmissionsCount(submissionsCount || 0);
      setStudentsCount(studentCount || 0);
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

  const handleCreateAssignment = async (assignmentData: { title: string; description: string; dueDate: string; driveLink: string }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          title: assignmentData.title,
          description: assignmentData.description,
          due_date: assignmentData.dueDate,
          drive_link: assignmentData.driveLink,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Assignment created successfully',
      });

      loadData();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error creating assignment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const totalSubmissions = assignments.length * studentsCount;
  const submissionRate = totalSubmissions > 0
    ? Math.round((submissionsCount / totalSubmissions) * 100)
    : 0;

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage assignments and track student progress
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Assignments</div>
                <div className="text-2xl font-bold">{assignments.length}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Students</div>
                <div className="text-2xl font-bold">{studentsCount}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Submissions</div>
                <div className="text-2xl font-bold">{submissionsCount}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="text-lg font-bold text-primary">{submissionRate}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Submission Rate</div>
                <div className="text-2xl font-bold">{submissionRate}%</div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Assignments</h2>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-smooth"
                >
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {assignment.description}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/admin/assignments`}>View Details</a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No assignments created yet. Click "Create Assignment" to get started.
            </div>
          )}
        </Card>
      </div>

      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateAssignment}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
