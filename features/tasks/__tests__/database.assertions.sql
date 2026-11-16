\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  child uuid := gen_random_uuid(); untouched uuid := gen_random_uuid();
  today date := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  completed timestamptz; n integer;
BEGIN
  ASSERT NOT has_function_privilege('anon','public.task_apply(jsonb)','EXECUTE');
  ASSERT NOT has_function_privilege('authenticated','public.task_rollover(uuid[],date,date)','EXECUTE');
  ASSERT has_function_privilege('service_role','public.task_dependency(uuid,uuid,boolean)','EXECUTE');
  ASSERT NOT has_table_privilege('anon','public.tasks','UPDATE');
  ASSERT (SELECT recurrence_handled_at IS NOT NULL FROM tasks WHERE title='Previously completed');
  PERFORM task_apply('[{"id":"00000000-0000-4000-8000-000000000001","status":"todo"}]');
  PERFORM task_apply('[{"id":"00000000-0000-4000-8000-000000000001","status":"done"}]');
  ASSERT (SELECT count(*)=1 FROM tasks WHERE title='Previously completed');

  INSERT INTO tasks(id,title,due_date,start_date,recurrence) VALUES (a,'Recurring',today-2,today-4,'daily');
  INSERT INTO tasks(id,title,due_date,parent_id) VALUES (child,'Child',today-2,a);
  INSERT INTO tasks(id,title,due_date) VALUES (b,'Dependent',today),(c,'Cancelled',today),(untouched,'Filtered out',today-3);
  PERFORM task_dependency(b,a);
  ASSERT (SELECT status='blocked' FROM tasks WHERE id=b);
  PERFORM task_dependency(c,a);
  PERFORM task_apply(jsonb_build_array(jsonb_build_object('id',c,'status','cancelled')));
  BEGIN
    PERFORM task_dependency(a,b);
    RAISE EXCEPTION 'Cycle accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Cycle accepted' THEN RAISE; END IF;
  END;
  PERFORM task_apply(jsonb_build_array(jsonb_build_object('id',a,'status','done','position',3)));
  ASSERT (SELECT status='todo' FROM tasks WHERE id=b);
  ASSERT (SELECT status='cancelled' FROM tasks WHERE id=c);
  SELECT completed_at INTO completed FROM tasks WHERE id=a;
  PERFORM task_apply(jsonb_build_array(jsonb_build_object('id',a,'status','done')));
  ASSERT (SELECT completed_at=completed AND position=3 FROM tasks WHERE id=a);
  ASSERT (SELECT count(*)=1 FROM tasks WHERE recurrence_origin_id=a);
  ASSERT (SELECT count(*)=1 FROM tasks WHERE parent_id IN (SELECT id FROM tasks WHERE recurrence_origin_id=a));
  PERFORM task_apply(jsonb_build_array(jsonb_build_object('id',a,'status','todo')));
  ASSERT (SELECT status='blocked' FROM tasks WHERE id=b);
  ASSERT (SELECT status='cancelled' FROM tasks WHERE id=c);
  PERFORM task_apply(jsonb_build_array(jsonb_build_object('id',a,'status','done')));
  ASSERT (SELECT count(*)=1 FROM tasks WHERE recurrence_origin_id=a);

  PERFORM task_apply(jsonb_build_array(jsonb_build_object('id',a,'status','todo')));
  BEGIN
    PERFORM task_apply(jsonb_build_array(jsonb_build_object('id',a,'status','done'),jsonb_build_object('id',gen_random_uuid(),'position',1)));
    RAISE EXCEPTION 'Partial batch committed';
  EXCEPTION WHEN no_data_found THEN NULL; END;
  ASSERT (SELECT status='todo' FROM tasks WHERE id=a);

  PERFORM task_rollover(ARRAY[a],today,today+1);
  ASSERT (SELECT due_date=today+1 AND start_date=today-4 AND reschedule_count=1 FROM tasks WHERE id=a);
  ASSERT (SELECT due_date=today-3 AND reschedule_count=0 FROM tasks WHERE id=untouched);
  BEGIN
    PERFORM task_rollover(ARRAY[untouched],today-1,today);
    RAISE EXCEPTION 'Stale preview accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM='Stale preview accepted' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM task_rollover(ARRAY[a,untouched],today,today);
    RAISE EXCEPTION 'Ineligible batch accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM='Ineligible batch accepted' THEN RAISE; END IF;
  END;
  ASSERT (SELECT due_date=today-3 FROM tasks WHERE id=untouched);
  PERFORM task_dependency(b,a,true);
  ASSERT (SELECT status='todo' FROM tasks WHERE id=b);
END $$;

CREATE FUNCTION reject_cloned_child() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN IF NEW.title='Reject clone' AND NEW.parent_id IS NOT NULL THEN RAISE EXCEPTION 'Clone failed'; END IF; RETURN NEW; END $$;
INSERT INTO tasks(id,title,due_date,recurrence) VALUES ('00000000-0000-4000-8000-000000000002','Rollback recurrence',current_date,'daily');
INSERT INTO tasks(title,due_date,parent_id) VALUES ('Reject clone',current_date,'00000000-0000-4000-8000-000000000002');
CREATE TRIGGER reject_clone BEFORE INSERT ON tasks FOR EACH ROW EXECUTE FUNCTION reject_cloned_child();
DO $$ BEGIN
  BEGIN
    PERFORM task_apply('[{"id":"00000000-0000-4000-8000-000000000002","status":"done"}]');
    RAISE EXCEPTION 'Clone failure ignored';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Clone failed' THEN RAISE; END IF; END;
  ASSERT (SELECT status='todo' AND recurrence_handled_at IS NULL FROM tasks WHERE id='00000000-0000-4000-8000-000000000002');
  ASSERT (SELECT count(*)=0 FROM tasks WHERE recurrence_origin_id='00000000-0000-4000-8000-000000000002');
END $$;
ROLLBACK;
