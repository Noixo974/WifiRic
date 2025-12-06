-- Add RLS policy to allow users to delete their own orders
CREATE POLICY "Users can delete own orders"
ON public.orders
FOR DELETE
USING (auth.uid() = user_id);