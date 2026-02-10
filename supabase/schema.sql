-- JobTrackr Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- ============================================================================
-- APPLICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  position TEXT,
  connection TEXT,
  date_applied DATE,
  date_responded DATE,
  interview_stage TEXT,
  num_interviews INTEGER,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);

-- ============================================================================
-- CONTACTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  position TEXT,
  school TEXT,
  major TEXT,
  grad_year INTEGER,
  email TEXT,
  phone TEXT,
  last_contact_date DATE,
  chat_length TEXT,
  chat_feel TEXT,
  relationship_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Applications Policies
-- Users can only see their own applications
CREATE POLICY "Users can view their own applications"
  ON applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own applications
CREATE POLICY "Users can create their own applications"
  ON applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own applications
CREATE POLICY "Users can update their own applications"
  ON applications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own applications
CREATE POLICY "Users can delete their own applications"
  ON applications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Contacts Policies
-- Users can only see their own contacts
CREATE POLICY "Users can view their own contacts"
  ON contacts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own contacts
CREATE POLICY "Users can create their own contacts"
  ON contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own contacts
CREATE POLICY "Users can update their own contacts"
  ON contacts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own contacts
CREATE POLICY "Users can delete their own contacts"
  ON contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for applications table
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for contacts table
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION: Add Contact Linking to Applications
-- ============================================================================

-- Add contact_id foreign key to applications table
-- This allows linking a contact from the network to a job application
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

-- Create index for faster lookups when joining applications with contacts
CREATE INDEX IF NOT EXISTS applications_contact_id_idx ON applications(contact_id);

-- Note: The existing 'connection' TEXT field is preserved for backward compatibility
-- and can be used for additional notes about the connection

-- ============================================================================
-- MIGRATION: Many-to-Many Contact Relationships
-- ============================================================================

-- Junction table for many-to-many relationship between applications and contacts
CREATE TABLE IF NOT EXISTS application_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate contact links
  UNIQUE(application_id, contact_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS application_contacts_application_id_idx
  ON application_contacts(application_id);
CREATE INDEX IF NOT EXISTS application_contacts_contact_id_idx
  ON application_contacts(contact_id);

-- RLS Policies (matching existing pattern)
ALTER TABLE application_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their application contacts"
  ON application_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_contacts.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their application contacts"
  ON application_contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_contacts.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their application contacts"
  ON application_contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_contacts.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Migrate existing contact_id relationships to junction table
INSERT INTO application_contacts (application_id, contact_id, created_at)
SELECT id, contact_id, created_at
FROM applications
WHERE contact_id IS NOT NULL
ON CONFLICT (application_id, contact_id) DO NOTHING;
