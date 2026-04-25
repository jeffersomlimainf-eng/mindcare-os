SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('patient_mood_logs','patient_tasks')
ORDER BY table_name, ordinal_position;
