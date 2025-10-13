/*
  # Create Forms Table

  ## Overview
  Creates the base forms table that stores form templates with tabs and fields.

  ## Tables Created

  ### 1. `forms`
  Main table for storing form templates
  - `id` (uuid, primary key)
  - `templateName` (text) - Name of the form template
  - `header` (jsonb) - Array of tabs with fields for header section
  - `lines` (jsonb) - Array of tabs with fields for lines section
  - `lineDetails` (jsonb) - Array of tabs with fields for line details section
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Policies for authenticated users to manage forms

  ## Notes
  - Each JSONB array contains tab objects with nested field arrays
  - Tab structure: { id, name, fields: [...] }
  - Field structure: { id, field_name, field_type, is_required, ... }
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