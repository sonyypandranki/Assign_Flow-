import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateAssignmentModal } from '@/components/CreateAssignmentModal';
import { StatusChip } from '@/components/StatusChip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  drive_link: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
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
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Load students (profiles with student role)
      const { data: studentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      if (rolesError) throw rolesError;

      const studentIds = studentRoles.map(r => r.user_id);

      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      // Load all submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*');

      if (submissionsError) throw submissionsError;

      setAssignments(assignmentsData || []);
      setStudents(studentsData || []);
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

  const handleCreateAssignment = async (assignmentData: any) => {
    if (!user) return;

    try {
      if (editingAssignment) {
        const { error } = await supabase
          .from('assignments')
          .update({
            title: assignmentData.title,
            description: assignmentData.description,
            due_date: assignmentData.dueDate,
            drive_link: assignmentData.driveLink,
          })
          .eq('id', editingAssignment.id);

        if (error) throw error;

        toast({
          title: 'Success!',
          description: 'Assignment updated successfully',
        });
        setEditingAssignment(undefined);
      } else {
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
      }

      loadData();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error saving assignment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Assignment deleted successfully',
      });

      loadData();
      if (selectedAssignment === id) {
        setSelectedAssignment(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error deleting assignment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsCreateModalOpen(true);
  };

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
            <h1 className="text-3xl font-bold mb-2">Manage Assignments</h1>
            <p className="text-muted-foreground">
              Create, edit, and track student submissions
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold">Assignments</h2>
            <div className="flex items-center gap-2">
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
            <div className="space-y-2">
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
                const assignmentSubmissions = submissions.filter(
                  s => s.assignment_id === assignment.id && s.status === 'submitted'
                );
                const completionRate = students.length > 0
                  ? Math.round((assignmentSubmissions.length / students.length) * 100)
                  : 0;
                  const visibleByStatus = (() => {
                    if (statusFilter === 'all') return true;
                    if (statusFilter === 'submitted') return assignmentSubmissions.length > 0;
                    return assignmentSubmissions.length === 0;
                  })();
                  if (!visibleByStatus) return null;

                return (
                  <Card
                    key={assignment.id}
                    className={`p-4 cursor-pointer transition-smooth ${
                      selectedAssignment === assignment.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAssignment(assignment.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium line-clamp-1">{assignment.title}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAssignment(assignment);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssignment(assignment.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Due {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })}
                    </div>
                    <div className="text-sm font-medium">
                      {assignmentSubmissions.length}/{students.length} submitted ({completionRate}%)
                    </div>
                  </Card>
                );
              })}

              {assignments.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No assignments yet</p>
                  <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Assignment
                  </Button>
                </Card>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedAssignment ? (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Student Submissions</h2>
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    placeholder="Filter students by name/email..."
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>File</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .filter((s) => {
                        const q = searchQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          s.full_name.toLowerCase().includes(q) ||
                          s.email.toLowerCase().includes(q)
                        );
                      })
                      .map((student) => {
                      const submission = submissions.find(
                        s => s.assignment_id === selectedAssignment && s.student_id === student.id
                      );
                        if (statusFilter !== 'all') {
                          const status = submission?.status || 'not-submitted';
                          if (statusFilter !== status) return null;
                        }
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.full_name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <StatusChip status={submission?.status || 'not-submitted'} />
                          </TableCell>
                          <TableCell>
                            {submission?.submitted_at
                              ? formatDistanceToNow(new Date(submission.submitted_at), {
                                  addSuffix: true,
                                })
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {submission?.file_url ? (
                              <a className="text-primary underline" href={submission.file_url} target="_blank" rel="noreferrer">View PDF</a>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  Select an assignment to view student submissions
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAssignment(undefined);
        }}
        onSave={handleCreateAssignment}
        assignment={editingAssignment ? {
          id: editingAssignment.id,
          title: editingAssignment.title,
          description: editingAssignment.description,
          dueDate: editingAssignment.due_date,
          driveLink: editingAssignment.drive_link,
          createdAt: editingAssignment.created_at,
        } : undefined}
      />
    </DashboardLayout>
  );
};

export default AdminAssignments;
