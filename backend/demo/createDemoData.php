<?php

require_once "/var/www/html/include/db.php";
require_once "/var/www/html/include/functions.php";
require_once "/var/www/html/include/vars.php";

if (php_sapi_name() !== 'cli') {
    exit('Access denied: This script can only be run via command line.');
}

set_time_limit(0);
ini_set('memory_limit', '256M');

writeLine("Demo data creation");
writeLine("======================================");
writeLine("");

writeLine("Connecting to database");

$connection = getDatabaseConnection();
writeStatus($connection);

if($connection)
{
    writeLine("Deleting old entries");
    $result = pg_query($connection, "TRUNCATE TABLE files CASCADE");
    writeStatus($result);

    if($result)
    {
        $insertedRows = [];
        $maxRows = 50000;

        // Root folders
        $rootFolders = [
            ["name" => "Documents", "id" => uuidv7()], 
            ["name" => "Pictures", "id" => uuidv7()], 
            ["name" => "Videos", "id" => uuidv7()], 
            ["name" => "Education", "id" => uuidv7()], 
            ["name" => "Misc", "id" => uuidv7()], 
            ["name" => "Tools", "id" => uuidv7()], 
            ["name" => "Personal", "id" => uuidv7()]
        ];
        
        // Redistribute data to folders randomly
        $count = count($rootFolders);
        $maxValue = intval(100 / $count) * 2;
        $remaining = 100;
        foreach ($rootFolders as $key => $rootFolder) 
        { 
            if ($key === $count - 1) {
                $rootFolders[$key]['percentage'] = $remaining;
                break;
            }
           
            if($remaining !== 0)
            {
                $percentage = random_int(1, $remaining > $maxValue ? $maxValue : $remaining);
            }
            else
            {
                $percentage = 0;
            }

            $rootFolders[$key]['percentage'] = $percentage;
            $remaining -= $percentage;
        }

        writeLine("Generating data");

        $fileCount = 1;
        $folderCount = 1;
        $lastCreatedFolderId = null;
        $currentTime = date('Y-m-d H:i:s');
        foreach ($rootFolders as $rootFolder) 
        {
            $insertedRows[] = "{$rootFolder['id']};{$rootFolder['name']};\\N;true;\\N;\\N;;\\N;{$currentTime};\\N\n";

            $count = intval($maxRows * ($rootFolder['percentage']/100.0));
            $subfolderCount = 1;
            for($i = 0; $i <= $count; $i++)
            {
                $id = uuidv7();
                $isFolder = (random_int(1, 100) <= 2); // Create a folder sometimes
                if($lastCreatedFolderId)
                {
                    $parentId = (random_int(1, 100) <= 80) ? $lastCreatedFolderId : $rootFolder['id'];  // Create in sub-folders sometimes
                }
                else
                {
                    $parentId = $rootFolder['id'];
                }

                if ($isFolder) 
                {
                    $name = "Folder " . $folderCount++;
                    $isFolderStr = 't';
                    $size = '\\N';
                    $mime = '\\N';
                    $path = '';
                    $s3Key = '\\N';
                    
                    if($parentId == $lastCreatedFolderId)
                    {
                        $subfolderCount++;
                        if($subfolderCount >= 5) 
                        {
                            $lastCreatedFolderId = null;
                        }
                    } 
                    else
                    {
                        $lastCreatedFolderId = $id;
                    }
                }
                else
                {        
                    $extension = $fileExtensions[array_rand($fileExtensions)];  
                    $name = "File " . $fileCount++ . "." . $extension;
                    $isFolderStr = 'f';
                    $size = random_int($genMinFileSize, $genMaxFileSize);
                    $mime = $mimeTypes[$extension];
                    $path = '';
                    $s3Key = $s3StoragePath . $id . "." . $extension;
                }

                $insertedRows[] = "{$id};{$name};{$parentId};{$isFolderStr};{$size};{$mime};{$path};{$s3Key};{$currentTime};\\N\n";
            }
        }
        writeStatus($insertedRows);

        writeLine("Saving data to database");
        $copyData = pg_copy_from($connection, "public.files", $insertedRows, ';');
        writeStatus($copyData);

        writeLine("Updating file paths");

        $result = pg_query($connection, "
            WITH RECURSIVE files_path AS (
                SELECT 
                    id, 
                    '/' || id::text || '/' AS path
                FROM public.files
                WHERE parent_id IS NULL
                
                UNION ALL
                
                SELECT 
                    child.id, 
                    parent.path || child.id::text || '/'
                FROM public.files child
                JOIN files_path parent ON child.parent_id = parent.id
            )

            UPDATE public.files f
            SET path = files_path.path
            FROM files_path
            WHERE 
                f.id = files_path.id;
        ");

        writeStatus($result);
    }
}

writeLine("======================================");
writeLine("");
writeLine("Script completed at: ".date("d.m.Y H:i:s"));

