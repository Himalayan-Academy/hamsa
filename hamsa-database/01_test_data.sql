--
-- Just bogus data
--
INSERT INTO image (
    path, 
    metadata, 
    date_modified, 
    file_missing)
VALUES (
    '/tmp/test2.jpeg',
    '{"key": "value", "key2": 2, "test": true}',
    NOW(),
    TRUE
);