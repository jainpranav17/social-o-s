-- Create chatbot leads table
CREATE TABLE public.chatbot_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_leads ENABLE ROW LEVEL SECURITY;

-- Policies for chatbot_leads
CREATE POLICY "Allow anonymous and authenticated inserts to chatbot_leads" 
  ON public.chatbot_leads FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous and authenticated select to chatbot_leads" 
  ON public.chatbot_leads FOR SELECT USING (true);

-- Create chatbot messages table
CREATE TABLE public.chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.chatbot_leads(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chatbot_messages
CREATE POLICY "Allow anonymous and authenticated inserts to chatbot_messages" 
  ON public.chatbot_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous and authenticated select to chatbot_messages" 
  ON public.chatbot_messages FOR SELECT USING (true);

-- Function to clean up messages older than 7 days
CREATE OR REPLACE FUNCTION public.tr_cleanup_old_messages()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.chatbot_messages WHERE created_at < now() - interval '7 days';
  RETURN NEW;
END;
$$;

-- Trigger to run cleanup automatically on insertion
CREATE TRIGGER cleanup_old_messages_trigger
  AFTER INSERT ON public.chatbot_messages
  FOR EACH STATEMENT EXECUTE FUNCTION public.tr_cleanup_old_messages();

-- Grant permissions
GRANT SELECT, INSERT ON public.chatbot_leads TO anon, authenticated;
GRANT ALL ON public.chatbot_leads TO service_role;

GRANT SELECT, INSERT ON public.chatbot_messages TO anon, authenticated;
GRANT ALL ON public.chatbot_messages TO service_role;
