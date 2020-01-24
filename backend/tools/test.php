<?php
if (PHP_SAPI == 'cli-server') {
    // To help the built-in PHP dev server, check if the request was actually for
    // something which should probably be served as a static file
    $url  = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false;
    }
}

require_once __DIR__ . '/../vendor/autoload.php';

// Load database configuration
require_once __DIR__ . '/../src/database.php';
require_once __DIR__ . '/../src/hamsa.php';
require_once __DIR__ . '/../src/exif.php';


$complex_description = <<<DESCR
This is a complex "description" with quotes and newlines

I really hope this 'works' this is important.
DESCR;

$res = setImageDescription("./image.jpg", $complex_description);

if ($res) {
    print "updated\n";
} else {
    print "error: $res\n";
}

$res = addImageTag("./image.jpg", "test tag");

if ($res) {
    print "updated\n";
} else {
    print "error: $res\n";
}

$res = removeImageTag("./image.jpg", "test tag");

if ($res) {
    print "updated\n";
} else {
    print "error: $res\n";
}
