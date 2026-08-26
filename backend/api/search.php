<?php

require_once "/var/www/html/include/db.php";
require_once "/var/www/html/include/functions.php";

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');

$connection = getDatabaseConnection();

// Clean the passed parameters
$term = filter_input(INPUT_GET, 'term', FILTER_SANITIZE_SPECIAL_CHARS);
$parentId = filter_input(INPUT_GET, 'parentId', FILTER_SANITIZE_SPECIAL_CHARS);
$limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT);

// Search for files, current folder has a priortiy
$result = pg_prepare($connection, "search_files", "
    WITH search_results as (
        SELECT 
            id, parent_id, name, path,
            row_number() over (ORDER BY parent_id = $2 DESC, name ASC) as num
        FROM public.files
        WHERE
            is_folder = false
            AND lower(name) like lower($1)
        LIMIT 10
    )
        
    SELECT 
        s.id,
        s.parent_id,
        s.name,
        (
            SELECT json_agg(json_build_object('id', f.id, 'name', f.name))
            FROM (
                SELECT unnest(string_to_array(trim(both '/' FROM s.path), '/')::uuid[]) AS parent_id
            ) p
            JOIN public.files f ON f.id = p.parent_id
            WHERE 
                f.id != s.id
        ) AS path_json,
        ceil(a.positon / $3) as page
    FROM (
        SELECT 
            f.id,
            row_number() OVER (
                PARTITION BY f.parent_id 
                ORDER BY f.is_folder DESC, f.name ASC 
            )::float AS positon
        FROM public.files f
        WHERE
            f.parent_id IN(select distinct parent_id from search_results)
    ) a
    JOIN search_results s ON a.id = s.id
    ORDER BY s.num
");
$result = pg_execute($connection, "search_files", [$term.'%', $parentId, $limit]);

// Return data to browser
$data = pg_fetch_all($result);
echo json_encode([
    'data' => $data
]);

