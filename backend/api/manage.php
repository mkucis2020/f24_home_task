<?php

require_once "/var/www/html/include/db.php";
require_once "/var/www/html/include/functions.php";
require_once "/var/www/html/include/vars.php";

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');

$connection = getDatabaseConnection();

// Clean the passed parameters
$rawJson = file_get_contents('php://input');
$jsonData = json_decode($rawJson, true);
$jsonData['data'] = json_decode($jsonData['data'], true);

$mainRules  = [
    'action' => FILTER_SANITIZE_SPECIAL_CHARS,
    'parentId' => FILTER_SANITIZE_SPECIAL_CHARS,
];
$dataRules = [
    'name' => FILTER_SANITIZE_SPECIAL_CHARS,
    'path' => FILTER_SANITIZE_SPECIAL_CHARS,
];

$request = filter_var_array($jsonData, $mainRules);
if (!empty($jsonData['data']) && is_array($jsonData['data'])) 
{   
    $request['data'] = filter_var_array($jsonData['data'], $dataRules);
}
if (!empty($jsonData['data']['selectedIds']) && is_array($jsonData['data']['selectedIds'])) 
{   
    $request['data']['selectedIds'] = filter_var_array($jsonData['data']['selectedIds'], FILTER_SANITIZE_SPECIAL_CHARS);
}

$response = [
    'isError' => false,
    'errorMessage' => '',
];
$errorMessage = '';

// Manage contents
$action = $request['action'];
switch($action)
{
    case 'ADD_FOLDER':
    case 'ADD_FILE':
        // Validate input name
        $name = trim($request['data']['name']);
        $parentId = !empty($request['parentId']) ? $request['parentId'] : null;
        $isFolder = $action == 'ADD_FOLDER' ? 't' : 'f';

        if (strlen($name) < 1 || strlen($name) > 50) 
        {
            $response['errorMessage'] = 'Name must be betwen 1 and 50 characters.';
            break;
        }
        if (preg_match('/[\/\\\\\:*?"<>|]/', $name)) 
        {
            $response['errorMessage'] = 'Name contains invalid characters.';
            break;
        }

        // Validate file extension
        $extension = '';
        if($isFolder == 'f')
        {
            $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if(!in_array($extension, $fileExtensions))
            {
                $response['errorMessage'] = "File extension '.{$extension}' is not supported currently.";
                break;
            }
        }

        // Check if file/folder exists
        $result = pg_prepare($connection, 'check_folder_exists', '
            SELECT 
                id
            FROM public.files
            WHERE 
                name = $1
                AND parent_id IS NOT DISTINCT FROM $2
                AND is_folder = $3
        ');

        $result = pg_execute($connection, 'check_folder_exists', [$name, $parentId, $isFolder]);

        if(pg_num_rows($result) == 0)
        {
            $id = uuidv7();
            $size = $isFolder == 'f' ? random_int($genMinFileSize, $genMaxFileSize) : null;
            $mimeType = $mimeTypes[$extension] ?? null;
            $path = "/{$id}" . ($request['data']['path'] ?? null);
            $storagePath = $isFolder == 'f' ? ($s3StoragePath . $id . $extension) : null;

            if(!$isFolder && empty($mimeType))
            {
                $response['errorMessage'] = "File extension '.{$extension}' doesn't have an assigned mime type.";
                break;
            }

            $insert = pg_prepare($connection, 'create_new_file_folder', "
                INSERT INTO public.files(id, name, parent_id, is_folder, size_bytes, mime_type, path, storage_path)
                SELECT $1, $2, $3, $4, $5, $6, $7, $8
            ");
            $insert = pg_execute($connection, 'create_new_file_folder', [$id, $name, $parentId, $isFolder, $size, $mimeType, $path, $storagePath]);
            if(pg_affected_rows($insert) == 0)
            {
                $response['errorMessage'] = "Error while saving data to database.";
                break;
            }
        }
        else
        {
            $response['errorMessage'] = 'Folder already exists, please use another name.';
        }
        break;
    case 'DELETE':
        // Delete files and folders using ON CASCADE in the table definiton
        $deleteIds = $request['data']['selectedIds'] ?? [];

        $i = 1;
        $sql = "DELETE FROM public.files WHERE id IN (";
        
        foreach($deleteIds as $index => $id)
        {
            $sql .= "\${$i}".($index !== count($deleteIds) - 1 ? ',' : ')');
            $i++;
        }

        $delete = pg_prepare($connection, 'delete_file_folder', $sql);
        $delete = pg_execute($connection, 'delete_file_folder', $deleteIds);
        if(pg_affected_rows($delete) == 0)
        {
            $response['errorMessage'] = "Error while deleting data from the database.";
            break;
        }
        break;
    default:
        $response['errorMessage'] = "Action {$action} is not valid.";
        break;
}

if(!empty($response['errorMessage']))
{
    $response['isError'] = true;
}

// Return data to the browser
echo json_encode($response);
