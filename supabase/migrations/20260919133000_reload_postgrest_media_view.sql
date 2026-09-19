-- Ensure PostgREST refreshes its schema cache after the public media view security/grant change.
notify pgrst, 'reload schema';
