<?php

function getDatabaseConnection($firstTime = false) {
    $connection = null;

    // Get parameters from the docker container
    $host     = getenv('DB_HOST');
    $db       = !$firstTime ? getenv('DB_NAME') : 'postgres'; 
    $user     = getenv('DB_USER');
    $password = getenv('DB_PASSWORD');
    $port     = getenv('DB_PORT');

    // Connect to database
    $connectionString = "host={$host} port=$port dbname={$db} user={$user} password={$password}";

    $connection = pg_connect($connectionString);

    if (!$connection) {
        $error = error_get_last();
        error_log("Database connection failed: {$error}" );
    }

    return $connection;
}