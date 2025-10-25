-- PostgreSQL script to create audit triggers using custom namespaced variables
DO $$
DECLARE
    table_record RECORD;
    schema_name TEXT;
    table_name TEXT;
BEGIN
    -- Find all tables that have the required audit columns
    FOR table_record IN 
        SELECT 
            c.table_name,
            c.table_schema
        FROM information_schema.columns c
        WHERE c.column_name IN ('instid', 'instdt', 'instterm', 'instprgnm', 'updtid', 'updtdt', 'updtprgnm')
        GROUP BY c.table_schema, c.table_name
        HAVING COUNT(DISTINCT c.column_name) = 7
    LOOP
        schema_name := table_record.table_schema;
        table_name := table_record.table_name;
        
        -- Drop existing objects
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_audit_insert ON %I.%I', table_name, schema_name, table_name);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_audit_update ON %I.%I', table_name, schema_name, table_name);
        EXECUTE format('DROP FUNCTION IF EXISTS %I.fn_%s_audit_insert()', schema_name, table_name);
        EXECUTE format('DROP FUNCTION IF EXISTS %I.fn_%s_audit_update()', schema_name, table_name);

        -- Create INSERT trigger function
        EXECUTE 'CREATE OR REPLACE FUNCTION ' || quote_ident(schema_name) || '.fn_' || table_name || '_audit_insert()
        RETURNS TRIGGER AS $insert_trigger$
        DECLARE
            v_user_id TEXT;
            v_program_name TEXT;
            v_terminal TEXT;
        BEGIN
            -- Get user ID from custom variable or use current_user as fallback
            BEGIN
                v_user_id := current_setting(''myapp.user_id'');
            EXCEPTION WHEN undefined_object THEN
                v_user_id := current_user;
            END;
            
            -- Get program name from custom variable or use application_name as fallback
            BEGIN
                v_program_name := current_setting(''myapp.program_name'');
            EXCEPTION WHEN undefined_object THEN
                BEGIN
                    v_program_name := current_setting(''application_name'');
                EXCEPTION WHEN undefined_object THEN
                    v_program_name := ''UNKNOWN'';
                END;
            END;
            
            -- Get terminal information (client IP)
            v_terminal := COALESCE(inet_client_addr()::text, ''UNKNOWN'');
            
            -- Set audit columns
            NEW.instid := v_user_id;
            NEW.instdt := CURRENT_TIMESTAMP;
            NEW.instterm := v_terminal;
            NEW.instprgnm := v_program_name;
            NEW.updtid := v_user_id;
            NEW.updtdt := CURRENT_TIMESTAMP;
            NEW.updtprgnm := v_program_name;
            
            RETURN NEW;
        END;
        $insert_trigger$ LANGUAGE plpgsql;';

        -- Create UPDATE trigger function
        EXECUTE 'CREATE OR REPLACE FUNCTION ' || quote_ident(schema_name) || '.fn_' || table_name || '_audit_update()
        RETURNS TRIGGER AS $update_trigger$
        DECLARE
            v_user_id TEXT;
            v_program_name TEXT;
        BEGIN
            -- Get user ID from custom variable or use current_user as fallback
            BEGIN
                v_user_id := current_setting(''myapp.user_id'');
            EXCEPTION WHEN undefined_object THEN
                v_user_id := current_user;
            END;
            
            -- Get program name from custom variable or use application_name as fallback
            BEGIN
                v_program_name := current_setting(''myapp.program_name'');
            EXCEPTION WHEN undefined_object THEN
                BEGIN
                    v_program_name := current_setting(''application_name'');
                EXCEPTION WHEN undefined_object THEN
                    v_program_name := ''UNKNOWN'';
                END;
            END;
            
            -- Update only update columns, preserve insert columns
            NEW.updtid := v_user_id;
            NEW.updtdt := CURRENT_TIMESTAMP;
            NEW.updtprgnm := v_program_name;
            NEW.instid := OLD.instid;
            NEW.instdt := OLD.instdt;
            NEW.instterm := OLD.instterm;
            NEW.instprgnm := OLD.instprgnm;
            
            RETURN NEW;
        END;
        $update_trigger$ LANGUAGE plpgsql;';

        -- Create triggers
        EXECUTE format('CREATE TRIGGER trg_%s_audit_insert BEFORE INSERT ON %I.%I FOR EACH ROW EXECUTE FUNCTION %I.fn_%s_audit_insert()',
            table_name, schema_name, table_name, schema_name, table_name);
        EXECUTE format('CREATE TRIGGER trg_%s_audit_update BEFORE UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION %I.fn_%s_audit_update()',
            table_name, schema_name, table_name, schema_name, table_name);

        RAISE NOTICE 'Created audit triggers for table: %.%', schema_name, table_name;
    END LOOP;
END $$;