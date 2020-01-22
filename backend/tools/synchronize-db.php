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


$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "/../");
$dotenv->load();

// Load database configuration
require_once __DIR__ . '/../src/database.php';
require_once __DIR__ . '/../src/hamsa.php';
require_once __DIR__ . '/../src/exif.php';


// List all images

$Directory = new RecursiveDirectoryIterator('/home/devhap/public_html/hamsa-images/');
$Iterator = new RecursiveIteratorIterator($Directory);
$allImages = new RegexIterator($Iterator, '/^.+\.jpg$/i', RecursiveRegexIterator::GET_MATCH);

print_r($argv);

// Begin image check
if (!isset($argv[1]) || $argv[1] !== "fix") { 
    foreach($allImages as $image) {
        $imageFile = $image[0];

        if (strpos($imageFile, "_cache") == false && strpos($imageFile, "_artists") == false && strpos($imageFile, "_text") == false ) {
    
            echo "$imageFile\n";

            try {
                if (isset($argv[1]) && $argv[1] == "rebuild") {
                    processImage($imageFile, true);
                } else {
                    processImage($imageFile, false);
                }
            } catch(Exception $e) {
                $msg = $e->getMessage();
                echo "Exception: $msg\n";
            }
        }
    }
}

// Update missing files...
echo "check for missing files...";

$records = ORM::for_table('image')
    ->find_array();

$total_missing_files = 0;
$total_count = count($records);
foreach($records as $image) {
    $path = $image["path"];
    $exists = file_exists($path);
    image_set_missing($image["image_id"], $exists);
    if (!$exists) {
        echo "File $path is missing\n";
        $total_missing_files++;
    }
}


echo "Total: $total_count\n";
echo "Total missing files: $total_missing_files\n";


// manivelu fix
ORM::raw_execute("update image set metadata = metadata::jsonb || '{\"Creator\": \"A. Manivelu\"}' where metadata->>'Creator' = 'ìA. Maniveluî'");
ORM::raw_execute("update image set metadata = metadata::jsonb || '{\"Creator\": \"A. Manivelu\"}' where metadata->>'Creator' = '“A. Manivelu”'");

// Rajam fix
ORM::raw_execute("update image set metadata = metadata::jsonb || '{\"Creator\": \"S. Rajam\"}' where metadata->>'Creator' = 'Rajam'");
