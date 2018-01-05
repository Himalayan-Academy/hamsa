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

require __DIR__ . '/../vendor/autoload.php';

// Load database configuration
require __DIR__ . '/../src/database.php';

use \Eventviva\ImageResize;

function cacheMultipleVersionsOfImage($path, $md5) {
    $thumb_path = "/var/www/html/images/_cache/${md5}.thumb.jpg";
    $image = new ImageResize($path);
    $image->quality_jpg = 75;
    $image->resizeToWidth(300);
    $image->save($thumb_path);
    echo "Saving thumb to ${thumb_path}\n";
}


function insertRecordForImage($path, $md5, $exif) {
    $record = ORM::for_table('image')->create();

    $record->set("path", $path);
    $record->set("checksum", $md5);
    $record->set_expr("date_modified", 'NOW()');
    $record->set("file_missing", false);
    $record->set("metadata", json_encode($exif));

    $record->save();
}

function updateRecordForImage($path, $md5, $exif) {
    $record = ORM::for_table('image')->where("path", $path)->find_one();

    $record->set("path", $path);
    $record->set("checksum", $md5);
    $record->set_expr("date_modified", 'NOW()');
    $record->set("file_missing", false);
    $record->set("metadata", json_encode($exif));

    $record->save();
}

function recordNeedsUpdate($path, $md5) {
    $record = ORM::for_table('image')->where("path", $path)->find_one();

    if ($record) {
        echo "$path ===> {$record->checksum}  / $md5\n";
        if ($record->checksum !== $md5) {
            return "nothing";
        } else {
            return "update";
        }
    }

    return "insert";
}

function processImage($path) {
    $md5 = md5_file($path);

    $reader = \PHPExif\Reader\Reader::factory(\PHPExif\Reader\Reader::TYPE_EXIFTOOL);

    $exif = $reader->read($path);
    $exifData = $exif->getData();

    switch (recordNeedsUpdate($path, $md5)) {
        case "update":
            echo "update...\n";
            updateRecordForImage($path, $md5, $exifData);
            cacheMultipleVersionsOfImage($path, $md5);
        break;
        case "insert":
            echo "insert...\n";
            insertRecordForImage($path, $md5, $exifData);
            cacheMultipleVersionsOfImage($path, $md5);
        break;
        case "nothing":
            echo "nothing...\n";
        break;
    }  
}



// List all images

$Directory = new RecursiveDirectoryIterator('/var/www/html/images/');
$Iterator = new RecursiveIteratorIterator($Directory);
$allImages = new RegexIterator($Iterator, '/^.+\.jpg$/i', RecursiveRegexIterator::GET_MATCH);

// Begin image check

foreach($allImages as $image) {
    $imageFile = $image[0];

    if (strpos($imageFile, "_cache") == false) {
   
        echo "$imageFile\n";

        processImage($imageFile);
    }
}