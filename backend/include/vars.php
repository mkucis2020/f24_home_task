<?php

$fileExtensions = ['pdf', 'docx', 'png', 'jpg', 'zip', 'mp4', 'xlsx', 'txt'];
$mimeTypes = [
    'pdf' => 'application/pdf', 'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'png' => 'image/png', 'jpg' => 'image/jpeg', 'zip' => 'application/zip',
    'mp4' => 'video/mp4', 'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'txt' => 'text/plain'
];

$genMinFileSize = 1024; // 1KB
$genMaxFileSize = 1073741824; // 1GB
$s3StoragePath = "/uploads/";