export type UserRole = 'student' | 'admin';

export type AssignmentStatus = 'not-submitted' | 'submitted';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  driveLink?: string;
  createdAt: string;
}

export interface StudentSubmission {
  assignmentId: string;
  studentId: string;
  status: AssignmentStatus;
  submittedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
}
