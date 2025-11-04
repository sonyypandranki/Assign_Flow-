-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  drive_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not-submitted', 'submitted')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
-- Everyone can view assignments
CREATE POLICY "Anyone can view assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can create assignments
CREATE POLICY "Only admins can create assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update their own assignments
CREATE POLICY "Only admins can update assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete assignments
CREATE POLICY "Only admins can delete assignments"
  ON public.assignments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for submissions
-- Students can view their own submissions, admins can view all
CREATE POLICY "Students can view own submissions, admins view all"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id OR public.has_role(auth.uid(), 'admin')
  );

-- Students can create their own submissions
CREATE POLICY "Students can create own submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own submissions
CREATE POLICY "Students can update own submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

-- Create index for better query performance
CREATE INDEX idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX idx_assignments_created_by ON public.assignments(created_by);