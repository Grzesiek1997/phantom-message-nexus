-- 🧪 TEST BEZPIECZEŃSTWA PO MIGRACJI
-- Uruchom te zapytania w Supabase SQL Editor aby sprawdzić czy RLS działa

-- 1. TEST: Sprawdź czy RLS jest włączony na wszystkich tabelach
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. TEST: Sprawdź liczbę polityk RLS
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 3. TEST: Sprawdź czy view v_blocked_summary ma RLS
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'v_blocked_summary';

-- 4. TEST: Spróbuj dostać się do danych jako anonymous (powinno być puste)
-- UWAGA: To powinno zwrócić 0 wierszy jeśli RLS działa!
SELECT COUNT(*) as messages_visible_to_anon FROM public.messages;
SELECT COUNT(*) as users_visible_to_anon FROM public.users;
SELECT COUNT(*) as conversations_visible_to_anon FROM public.conversations;

-- 5. TEST: Sprawdź czy funkcje bezpieczeństwa istnieją
SELECT 
    proname as function_name,
    prosecdef as security_definer
FROM pg_proc 
WHERE proname IN ('can_access_conversation', 'can_access_message');

-- 6. WYNIK OCZEKIWANY:
-- - Wszystkie tabele powinny mieć rls_enabled = true
-- - Każda tabela powinna mieć przynajmniej 1 politykę RLS
-- - Zapytania anonymous powinny zwrócić 0 wierszy
-- - Funkcje bezpieczeństwa powinny istnieć

-- 7. CZERWONE FLAGI (jeśli to zobaczysz - coś jest źle!):
-- - rls_enabled = false na jakiejkolwiek tabeli
-- - policy_count = 0 dla jakiejkolwiek tabeli  
-- - messages_visible_to_anon > 0
-- - users_visible_to_anon > 0
