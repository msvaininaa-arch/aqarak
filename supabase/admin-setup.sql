-- =====================================================================
-- عقارك — جعل حسابك مديرًا (يُشغَّل مرة واحدة بعد schema.sql)
-- 1) أنشئ المستخدم أولًا: Authentication → Users → Add user → Create new user
--    (ضع بريدك وكلمة مرور قوية، وفعّل Auto Confirm User)
-- 2) ضع بريدك مكان YOUR_EMAIL أدناه، ثم Run
-- =====================================================================
insert into public.admins (user_id)
select id from auth.users where email = 'YOUR_EMAIL'
on conflict (user_id) do nothing;

-- للتأكد: يجب أن يظهر سطر واحد
select u.email, a.created_at from public.admins a join auth.users u on u.id = a.user_id;
