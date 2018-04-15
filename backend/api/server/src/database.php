<?php
/**
 * Database configuration
 */


$dbname = getenv("POSTGRES_DB");
$dbpassword = getenv("POSTGRES_PASSWORD");
$dbuser = getenv("POSTGRES_USER");

ORM::configure("pgsql:host=database;dbname=${dbname};port=5432");
ORM::configure('username', $dbuser);
ORM::configure('password', $dbpassword);
ORM::configure('id_column_overrides', array(
    'image' => 'image_id',
    'collection' => 'collection_id',
    'tag' => 'tag_id',
    'artist' => 'artist_id',
    'account' => 'account_id'
));