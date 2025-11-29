-- Create a function to check review limit per user (max 10)
CREATE OR REPLACE FUNCTION public.check_review_limit()
RETURNS TRIGGER AS $$
DECLARE
  review_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO review_count
  FROM public.reviews
  WHERE user_id = NEW.user_id;
  
  IF review_count >= 10 THEN
    RAISE EXCEPTION 'Vous avez atteint la limite de 10 avis maximum';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce the limit before insert
CREATE TRIGGER enforce_review_limit
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.check_review_limit();