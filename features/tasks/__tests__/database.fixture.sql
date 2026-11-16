CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role;
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL,
  description text, priority text NOT NULL DEFAULT 'MEDIUM', category text,
  status text NOT NULL DEFAULT 'todo', due_date date NOT NULL,
  recurrence text NOT NULL DEFAULT 'none', position integer NOT NULL DEFAULT 0,
  reschedule_count integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz, parent_id uuid REFERENCES public.tasks ON DELETE CASCADE,
  estimated_minutes integer, tags text[] DEFAULT '{}', start_date date,
  due_time time, start_time time, recurrence_origin_id uuid, archived_at timestamptz
);
CREATE TABLE public.task_dependencies (
  task_id uuid REFERENCES public.tasks ON DELETE CASCADE,
  depends_on uuid REFERENCES public.tasks ON DELETE CASCADE,
  PRIMARY KEY(task_id, depends_on)
);
GRANT ALL ON public.tasks, public.task_dependencies TO service_role, anon, authenticated;
INSERT INTO public.tasks(id,title,due_date,status,recurrence,completed_at)
VALUES ('00000000-0000-4000-8000-000000000001','Previously completed',current_date,'done','daily',now());
