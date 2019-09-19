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


$dotenv = Dotenv\Dotenv::create(__DIR__ . "/../");
$dotenv->load();

// Load database configuration
require __DIR__ . '/../src/database.php';
require __DIR__ . '/../src/hamsa.php';

use \Gumlet\ImageResize;

function cacheMultipleVersionsOfImage($path, $md5) {
    $thumb_path = "/home/devhap/public_html/hamsa-images/_cache/${md5}.thumb.jpg";
    $image = new ImageResize($path);
    $image->quality_jpg = 75;
    $image->resizeToWidth(300);
    $image->save($thumb_path);
    echo "Saving thumb to ${thumb_path}\n";

    // cache higher sized version as well.
    $med_path = "/home/devhap/public_html/hamsa-images/_cache/${md5}.med.jpg";
    $image = new ImageResize($path);
    $image->quality_jpg = 75;
    $image->resizeToWidth(800);
    $image->save($med_path);
    echo "Saving medium size to ${med_path}\n";
}

function insertArtistIfNeeded($exif) {
    if (!isset($exif["author"])) return false;

    $artist = $exif["author"];

    if (artist_exists($artist)) {
        return false;
    }

    $meta = array(
        "aliases" => array($artist),
        "description" => "lorem ipsum",
        "photo" => ""
    );

    $record = ORM::for_table('artist')->create();

    $record->set("name", $artist);
    $record->set_expr("date_modified", 'NOW()');
    $record->set("metadata", json_encode($meta));

    $record->save();
    echo "Inserted artists ${artist}\n";

}

function insertRecordForImage($path, $md5, $exif) {
    $record = ORM::for_table('image')->create();

    $record->set("path", $path);
    $record->set("checksum", $md5);
    $record->set_expr("date_modified", 'NOW()');
    $record->set("file_missing", false);
    $exif["author"] = getAuthor($exif);
    $record->set("metadata", json_encode($exif));

    $record->save();
}

function updateRecordForImage($path, $md5, $exif) {
    $record = ORM::for_table('image')->where("path", $path)->find_one();

    $record->set("path", $path);
    $record->set("checksum", $md5);
    $record->set_expr("date_modified", 'NOW()');
    $record->set("file_missing", false);
    $exif["author"] = getAuthor($exif);
    $record->set("metadata", json_encode($exif));

    $record->save();
}

function getAuthor($exif) {
    if (isset($exif["author"]) && !is_null($exif["author"])) return $exif["author"];
    
    $reducer = function($acc, $e) {
        if ($acc !== "") return $acc;
        
        if (strpos($e, 'Artist') !== false) {
            return str_replace("Artist ","", $e);
        }
    };

    if (isset($exif["keywords"])) {
        $v = array_reduce($exif["keywords"], $reducer, "");
        echo "author from keyword: $v\n";
        return $v;
    } else {
        return "";
    }
}

function recordNeedsUpdate($path, $md5) {
    $record = ORM::for_table('image')->where("path", $path)->find_one();

    if ($record) {
        echo "$path ===> {$record->checksum} / $md5\n";
        if ((strcmp($record->checksum, $md5) == 0) && (file_exists($record->path))) {
            return "nothing";
        } else {
            return "update";
        }
    }

    return "insert";
}

function processImage($path) {
    $md5 = md5_file($path);
    $thumb_path = "/home/devhap/public_html/hamsa-images/_cache/${md5}.thumb.jpg";
    $med_path = "/home/devhap/public_html/hamsa-images/_cache/${md5}.med.jpg";


    $reader = \PHPExif\Reader\Reader::factory(\PHPExif\Reader\Reader::TYPE_EXIFTOOL);

    $exif = $reader->read($path);
    $exifData = $exif->getData();

    if (isset($exifData["keywords"])) {
        if (!is_array($exifData["keywords"])) {
            // print_r($exifData["keywords"]);
            $exifData["keywords"] = [$exifData["keywords"]];
            // die(1);
        }
    }

    switch (recordNeedsUpdate($path, $md5)) {
        case "update":
            echo "update...\n";
            updateRecordForImage($path, $md5, $exifData);
        break;
        case "insert":
            echo "insert...\n";
            insertRecordForImage($path, $md5, $exifData);
        break;
        case "nothing":
            echo "nothing...\n";
        break;
    }
    
    if (!file_exists($thumb_path) ||!file_exists($med_path) ) {
        cacheMultipleVersionsOfImage($path, $md5);
    }

    insertArtistIfNeeded($exifData);
}



// List all images

$Directory = new RecursiveDirectoryIterator('/home/devhap/public_html/hamsa-images/');
$Iterator = new RecursiveIteratorIterator($Directory);
$allImages = new RegexIterator($Iterator, '/^.+\.jpg$/i', RecursiveRegexIterator::GET_MATCH);

// Begin image check
if (!isset($argc[1]) || $argc[1] !== "fix") { 
    foreach($allImages as $image) {
        $imageFile = $image[0];

        if (strpos($imageFile, "_cache") == false && strpos($imageFile, "_artists") == false && strpos($imageFile, "_text") == false ) {
    
            echo "$imageFile\n";

            try {
            processImage($imageFile);
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
ORM::raw_execute("update image set metadata = metadata::jsonb || '{\"author\": \"A. Manivelu\"}' where metadata->>'author' = 'ìA. Maniveluî'");
ORM::raw_execute("update image set metadata = metadata::jsonb || '{\"author\": \"A. Manivelu\"}' where metadata->>'author' = '“A. Manivelu”'");

// Rajam fix
ORM::raw_execute("update image set metadata = metadata::jsonb || '{\"author\": \"S. Rajam\"}' where metadata->>'author' = 'Rajam'");
