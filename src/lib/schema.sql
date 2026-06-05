-- ====================================================================
-- CYFERION (SCAMGUARD) V1 DATABASE SCHEMA
-- This file defines all PostgreSQL tables, relationships, constraints,
-- and Row-Level Security (RLS) policies for the Cyferion application.
-- Copy and paste this directly into your Supabase SQL Editor.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXTENSIONS SETUP
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. TABLE CREATION
-- --------------------------------------------------------------------

-- Table: guardians (Vite frontend authenticated managers)
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: protected_users (vulnerable family members linked to a Guardian)
CREATE TABLE IF NOT EXISTS public.protected_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('elderly', 'adult', 'child')),
    protection_level TEXT NOT NULL DEFAULT 'medium' CHECK (protection_level IN ('low', 'medium', 'high')),
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: messages (incoming SMS logs intercepted from mobile clients)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('safe', 'quarantine', 'blocked')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    protected_user_id UUID NOT NULL REFERENCES public.protected_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: alerts (quarantined messages pending Guardian review)
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved_safe', 'resolved_deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: scam_analysis (detailed heuristic engine scores for incoming texts)
CREATE TABLE IF NOT EXISTS public.scam_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    urgency_score INTEGER NOT NULL,
    link_score INTEGER NOT NULL,
    impersonation_score INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    risk_verdict TEXT NOT NULL CHECK (risk_verdict IN ('safe', 'quarantine', 'blocked')),
    flagged_keywords TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    flagged_links TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 3. ENABLE ROW-LEVEL SECURITY (RLS)
-- --------------------------------------------------------------------
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protected_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_analysis ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 4. ROW-LEVEL SECURITY POLICIES
-- --------------------------------------------------------------------

-- RLS: guardians (read/update own profile)
CREATE POLICY "Allow guardians to read and update their own profile" ON public.guardians
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Allow guardians to update their own profile" ON public.guardians
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- RLS: guardians (create own profile on first login)
CREATE POLICY "Allow authenticated users to create their own guardian profile" ON public.guardians
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS: protected_users
CREATE POLICY "Allow guardians to manage their linked family members" ON public.protected_users
    FOR ALL
    USING (auth.uid() = guardian_id)
    WITH CHECK (auth.uid() = guardian_id);

-- RLS: messages
CREATE POLICY "Allow guardians to view messages of their linked family members" ON public.messages
    FOR SELECT
    USING (
        protected_user_id IN (
            SELECT id FROM public.protected_users WHERE guardian_id = auth.uid()
        )
    );

CREATE POLICY "Allow API SMS Ingestion to insert new intercepted messages" ON public.messages
    FOR INSERT
    WITH CHECK (true); -- Allows our Express API webhook to log messages for any relative

CREATE POLICY "Allow guardians to delete messages of their family members" ON public.messages
    FOR DELETE
    USING (
        protected_user_id IN (
            SELECT id FROM public.protected_users WHERE guardian_id = auth.uid()
        )
    );

-- RLS: alerts
CREATE POLICY "Allow guardians to manage their own alerts" ON public.alerts
    FOR ALL
    USING (auth.uid() = guardian_id)
    WITH CHECK (auth.uid() = guardian_id);

CREATE POLICY "Allow API SMS Ingestion to create alerts" ON public.alerts
    FOR INSERT
    WITH CHECK (true); -- Allows Express API webhook to inject quarantine alerts

-- RLS: scam_analysis
CREATE POLICY "Allow guardians to read heuristic reviews of their family messages" ON public.scam_analysis
    FOR SELECT
    USING (
        message_id IN (
            SELECT m.id FROM public.messages m
            JOIN public.protected_users p ON m.protected_user_id = p.id
            WHERE p.guardian_id = auth.uid()
        )
    );

CREATE POLICY "Allow API SMS Ingestion to insert heuristic analyses" ON public.scam_analysis
    FOR INSERT
    WITH CHECK (true); -- Allows Express API webhook to insert scan data

-- --------------------------------------------------------------------
-- 5. REAL-TIME PUBLICATION CONFIGURATION
-- --------------------------------------------------------------------
-- Enable real-time updates for notifications on the dashboard
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.messages;
