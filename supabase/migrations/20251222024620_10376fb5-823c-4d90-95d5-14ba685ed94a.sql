-- Add RLS policy to allow admins to manage user_roles
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add foreign key from user_roles to profiles for easier joins
ALTER TABLE public.user_roles
ADD CONSTRAINT fk_user_roles_profiles
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;