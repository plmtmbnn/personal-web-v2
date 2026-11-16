BEGIN;

ALTER TABLE public.tasks ADD COLUMN recurrence_handled_at timestamptz;
UPDATE public.tasks SET recurrence_handled_at = coalesce(completed_at, now())
WHERE status = 'done' AND recurrence IN ('daily', 'weekly', 'monthly');

CREATE FUNCTION public.task_before_write() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF NEW.start_date > NEW.due_date THEN NEW.due_date := NEW.start_date; END IF;
  IF NEW.status = 'done' THEN
    IF TG_OP = 'UPDATE' AND OLD.status = 'done' THEN
      NEW.completed_at := OLD.completed_at;
    ELSE NEW.completed_at := now(); END IF;
  ELSE NEW.completed_at := NULL; END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER task_before_write BEFORE INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.task_before_write();

CREATE FUNCTION public.task_after_write() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  successor public.tasks%ROWTYPE;
  step interval;
  next_due date;
BEGIN
  IF NEW.status = 'done' AND NEW.recurrence IN ('daily', 'weekly', 'monthly')
     AND NEW.recurrence_handled_at IS NULL THEN
    UPDATE public.tasks SET recurrence_handled_at = now() WHERE id = NEW.id;
    step := CASE NEW.recurrence WHEN 'daily' THEN interval '1 day'
      WHEN 'weekly' THEN interval '7 days' ELSE interval '1 month' END;
    next_due := (greatest(NEW.due_date, (now() AT TIME ZONE 'Asia/Jakarta')::date) + step)::date;
    SELECT * INTO successor FROM public.tasks
      WHERE recurrence_origin_id = coalesce(NEW.recurrence_origin_id, NEW.id)
        AND due_date = next_due LIMIT 1;
    IF NOT FOUND THEN
      INSERT INTO public.tasks(title, description, priority, category, status, due_date,
        recurrence, tags, estimated_minutes, parent_id, start_date, start_time, due_time,
        recurrence_origin_id, position, reschedule_count)
      VALUES (NEW.title, NEW.description, NEW.priority, NEW.category, 'todo', next_due,
        NEW.recurrence, NEW.tags, NEW.estimated_minutes, NEW.parent_id,
        CASE WHEN NEW.start_date IS NOT NULL THEN
          least(next_due, (greatest(NEW.start_date, (now() AT TIME ZONE 'Asia/Jakarta')::date) + step)::date) END,
        NEW.start_time, NEW.due_time, coalesce(NEW.recurrence_origin_id, NEW.id), NEW.position, 0)
      RETURNING * INTO successor;
      INSERT INTO public.tasks(title, description, priority, category, status, due_date,
        recurrence, tags, estimated_minutes, parent_id, position, reschedule_count)
      SELECT title, description, priority, category, 'todo', next_due, 'none', tags,
        estimated_minutes, successor.id, position, 0
      FROM public.tasks WHERE parent_id = NEW.id AND archived_at IS NULL;
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'done' THEN
      UPDATE public.tasks t SET status = 'todo'
      WHERE t.status = 'blocked' AND t.id IN (
        SELECT task_id FROM public.task_dependencies WHERE depends_on = NEW.id)
      AND NOT EXISTS (SELECT 1 FROM public.task_dependencies d JOIN public.tasks b ON b.id = d.depends_on
        WHERE d.task_id = t.id AND b.status <> 'done');
    ELSIF OLD.status = 'done' THEN
      UPDATE public.tasks SET status = 'blocked' WHERE status NOT IN ('done', 'cancelled', 'blocked')
        AND id IN (SELECT task_id FROM public.task_dependencies WHERE depends_on = NEW.id);
    END IF;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER task_after_write AFTER INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.task_after_write();

CREATE FUNCTION public.task_apply(p_updates jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE item jsonb; current_task public.tasks%ROWTYPE; patched public.tasks%ROWTYPE;
BEGIN
  -- Serialize multi-row task operations, including recurrence and dependency effects.
  PERFORM pg_advisory_xact_lock(72617411);
  IF jsonb_typeof(p_updates) <> 'array' OR jsonb_array_length(p_updates) NOT BETWEEN 1 AND 1000 THEN
    RAISE EXCEPTION 'Invalid task batch';
  END IF;
  IF (SELECT count(*) <> count(DISTINCT value->>'id') FROM jsonb_array_elements(p_updates)) THEN
    RAISE EXCEPTION 'Duplicate task IDs';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_updates) LOOP
    IF EXISTS (SELECT 1 FROM jsonb_object_keys(item - 'id') k WHERE k NOT IN
      ('title','description','priority','category','due_date','start_date','start_time','due_time',
       'status','recurrence','estimated_minutes','tags','position')) THEN
      RAISE EXCEPTION 'Unsupported task field';
    END IF;
    SELECT * INTO STRICT current_task FROM public.tasks WHERE id = (item->>'id')::uuid FOR UPDATE;
    SELECT * INTO patched FROM jsonb_populate_record(current_task, item);
    IF patched.status NOT IN ('todo','in_progress','done','blocked','cancelled')
      OR patched.priority NOT IN ('LOW','MEDIUM','HIGH') OR btrim(patched.title) = '' THEN
      RAISE EXCEPTION 'Invalid task values';
    END IF;
    UPDATE public.tasks SET title=patched.title, description=patched.description,
      priority=patched.priority, category=patched.category, due_date=patched.due_date,
      start_date=patched.start_date, start_time=patched.start_time, due_time=patched.due_time,
      status=patched.status, recurrence=patched.recurrence, estimated_minutes=patched.estimated_minutes,
      tags=patched.tags, position=patched.position,
      reschedule_count=coalesce(current_task.reschedule_count,0) + CASE WHEN greatest(patched.due_date, patched.start_date) > current_task.due_date THEN 1 ELSE 0 END
      WHERE id=current_task.id;
  END LOOP;
END $$;

CREATE FUNCTION public.task_rollover(p_ids uuid[], p_preview_date date, p_target_date date) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE today date := (now() AT TIME ZONE 'Asia/Jakarta')::date; eligible integer;
BEGIN
  PERFORM pg_advisory_xact_lock(72617411);
  IF p_preview_date IS DISTINCT FROM today OR p_target_date NOT IN (today, today + 1)
    OR p_target_date IS NULL OR coalesce(cardinality(p_ids),0) NOT BETWEEN 1 AND 1000
    OR cardinality(p_ids) <> (SELECT count(DISTINCT id) FROM unnest(p_ids) id) THEN
    RAISE EXCEPTION 'Preview expired. Refresh and try again.';
  END IF;
  PERFORM id FROM public.tasks WHERE id=ANY(p_ids) FOR UPDATE;
  SELECT count(*) INTO eligible FROM public.tasks WHERE id=ANY(p_ids)
    AND status NOT IN ('done','cancelled') AND due_date < today
    AND (start_date IS NULL OR start_date <= today) AND parent_id IS NULL AND archived_at IS NULL;
  IF eligible <> cardinality(p_ids) THEN RAISE EXCEPTION 'Tasks changed. Refresh the preview.'; END IF;
  UPDATE public.tasks SET due_date=p_target_date, reschedule_count=coalesce(reschedule_count,0)+1
    WHERE id=ANY(p_ids);
END $$;

CREATE FUNCTION public.task_dependency(p_task_id uuid, p_depends_on uuid, p_remove boolean DEFAULT false) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(72617411);
  PERFORM id FROM public.tasks WHERE id IN (p_task_id,p_depends_on) FOR UPDATE;
  IF p_remove THEN
    DELETE FROM public.task_dependencies WHERE task_id=p_task_id AND depends_on=p_depends_on;
  ELSE
    IF p_task_id=p_depends_on OR EXISTS (
      WITH RECURSIVE blockers(id) AS (
        SELECT p_depends_on UNION SELECT d.depends_on FROM public.task_dependencies d JOIN blockers b ON d.task_id=b.id
      ) SELECT 1 FROM blockers WHERE id=p_task_id
    ) THEN RAISE EXCEPTION 'A task cannot depend on itself or form a dependency cycle.'; END IF;
    INSERT INTO public.task_dependencies(task_id,depends_on) VALUES (p_task_id,p_depends_on);
  END IF;
  IF EXISTS (SELECT 1 FROM public.task_dependencies d JOIN public.tasks b ON b.id=d.depends_on
    WHERE d.task_id=p_task_id AND b.status <> 'done') THEN
    UPDATE public.tasks SET status='blocked' WHERE id=p_task_id AND status NOT IN ('done','cancelled');
  ELSE
    UPDATE public.tasks SET status='todo' WHERE id=p_task_id AND status='blocked';
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.task_apply(jsonb), public.task_rollover(uuid[],date,date),
  public.task_dependency(uuid,uuid,boolean), public.task_before_write(), public.task_after_write()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.task_apply(jsonb), public.task_rollover(uuid[],date,date),
  public.task_dependency(uuid,uuid,boolean) TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.tasks, public.task_dependencies FROM PUBLIC, anon, authenticated;

COMMIT;
