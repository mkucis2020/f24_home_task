<?php

require_once "/var/www/html/include/db.php";
require_once "/var/www/html/include/functions.php";

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');

$connection = getDatabaseConnection();

// Clean the passed parameters
$parentId = filter_input(INPUT_GET, 'parentId', FILTER_SANITIZE_SPECIAL_CHARS);
$page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT);
$limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT);

// Calculate offset
$offset = ($page - 1) * $limit;

// Get total count in the same request
$result = pg_prepare($connection, "get_row_count", "
    SELECT 
        COUNT(*) as total 
    FROM public.files
    Where
        parent_id IS NOT DISTINCT FROM $1
");
$result = pg_execute($connection, "get_row_count", [$parentId]);
$rowCount = pg_fetch_assoc($result);

// Get the contents of a folder
$result = pg_prepare($connection, "fetch_contents", "
    SELECT
        id, name, is_folder, mime_type, size_bytes, created_at, updated_at
    FROM public.files
    WHERE
        parent_id IS NOT DISTINCT FROM $1
    ORDER BY is_folder DESC, name ASC 
    Limit $2 OFFSET $3;
");
$result = pg_execute($connection, "fetch_contents", [$parentId, $limit, $offset]);

// Return data to browser
$data = pg_fetch_all($result);
echo json_encode([
    'data' => $data,
    'totalRows' => $rowCount['total']
]);