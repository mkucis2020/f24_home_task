<?php

require_once "/var/www/html/include/db.php";
require_once "/var/www/html/include/functions.php";
require_once "/var/www/html/include/vars.php";

if (php_sapi_name() !== 'cli') {
    exit('Access denied: This script can only be run via command line.');
}

set_time_limit(0);

$dbName = getenv('DB_NAME');

writeLine("Database initialization");
writeLine("======================================");
writeLine("");

writeLine("Connecting to database");

// Connect to default database
$connection = getDatabaseConnection(true);
writeStatus($connection);

if($connection)
{
    // Check if database exists
    $result = pg_query($connection, "
        SELECT 1 
        FROM pg_catalog.pg_database 
        WHERE 
            datname = '{$dbName}'
    ");

    if(pg_num_rows($result) == 0)
    {
        writeLine("Creating database");
        $query = pg_query($connection, "CREATE DATABASE {$dbName}");
        writeStatus($query);
    }
    
    // Connect to new database
    unset($connection);
    $connection = getDatabaseConnection();

    writeLine("Enabling UUID extension");
    $query = pg_query($connection, "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"");
    writeStatus($query);

    writeLine("Creating tables");
    $query = pg_query($connection, "
        CREATE TABLE IF NOT EXISTS files (
            id UUID PRIMARY KEY DEFAULT uuidv7(),
            name VARCHAR(255) NOT NULL,
            parent_id UUID REFERENCES files(id) ON DELETE CASCADE,
            is_folder BOOLEAN NOT NULL DEFAULT FALSE,
            size_bytes BIGINT DEFAULT NULL,
            mime_type VARCHAR(100) DEFAULT NULL,
            path TEXT NOT NULL,
            storage_path VARCHAR(256) DEFAULT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL

            CONSTRAINT chk_folder_metadata CHECK (
                (is_folder = TRUE AND size_bytes IS NULL AND storage_path IS NULL) OR
                (is_folder = FALSE)
            )
        );
    ");
    writeStatus($query);

    writeLine("Creating indexes");
    $query = pg_query($connection, " 
        CREATE INDEX IF NOT EXISTS idx_files_parent_id ON files(parent_id);
        CREATE INDEX IF NOT EXISTS idx_files_type ON files(is_folder);
        CREATE INDEX IF NOT EXISTS idx_files_path ON files (path text_pattern_ops);
    ");
    writeStatus($query);
    
}

writeLine("======================================");
writeLine("");
writeLine("Script completed at: ".date("d.m.Y H:i:s"));







