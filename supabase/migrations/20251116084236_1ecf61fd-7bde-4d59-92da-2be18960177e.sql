-- Add DELETE policies for contact_messages table

-- Policy for users to delete their own messages
CREATE POLICY "Users can delete own messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy for admins to delete all messages
CREATE POLICY "Admins can delete all messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));