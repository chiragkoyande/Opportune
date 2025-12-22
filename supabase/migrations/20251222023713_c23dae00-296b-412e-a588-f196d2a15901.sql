-- Create opportunities table for admin-uploaded data
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hackathon', 'internship', 'contest')),
  organization TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  apply_url TEXT NOT NULL,
  location TEXT,
  prize TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'Admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Everyone can view active opportunities
CREATE POLICY "Anyone can view active opportunities"
ON public.opportunities FOR SELECT
USING (is_active = true);

-- Only admins can insert opportunities
CREATE POLICY "Admins can insert opportunities"
ON public.opportunities FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update opportunities
CREATE POLICY "Admins can update opportunities"
ON public.opportunities FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete opportunities
CREATE POLICY "Admins can delete opportunities"
ON public.opportunities FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updating timestamps
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();