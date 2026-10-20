-- Script pour promouvoir un trésorier
UPDATE public.profils
SET role = 'tresorier'
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'tresorier@eglisebunia.org'
);
