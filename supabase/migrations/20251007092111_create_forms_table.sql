/*
  # Create Forms Table

  ## Overview
  Creates the base forms table that stores form templates.

  ## Tables Created
  
  ### 1. `forms`
  Main table for storing form templates
  - `id` (uuid, primary key)
  - `templateName` (text) - Name of the form template
  - `header` (jsonb) - Header configuration (deprecated - will use form_tabs)
  - `lines` (jsonb) - Lines configuration (deprecated - will use form_tabs)
  - `lineDetails` (jsonb) - Line details configuration (deprecated - will use form_tabs)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Policies for authenticated users to manage forms

  ## Notes
  - The jsonb columns are kept for backward compatibility
  - New structure will use form_tabs and form_fields tables
*/

CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  templateName text NOT NULL,
  header jsonb DEFAULT '[]'::jsonb,
  lines jsonb DEFAULT '[]'::jsonb,
  lineDetails jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Policies for forms
CREATE POLICY "Users can view all forms"
  ON forms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert forms"
  ON forms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update forms"
  ON forms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete forms"
  ON forms FOR DELETE
  TO authenticated
  USING (true);