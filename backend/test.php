<?php


require_once __DIR__ . '/vendor/autoload.php';

// Load database configuration
require_once __DIR__ . '/src/database.php';

// Load hamsa auxiliary routines
require_once __DIR__ . '/src/hamsa.php';

print(json_encode(artist_get_all()));