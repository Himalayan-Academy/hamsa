<?php

/**
* Exif manipulation routines for admin panel
* Author: Andre Alves Garzia
* Date: 2019-12-03
*/

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

use \Gumlet\ImageResize;

function exiftool_set_value($path, $key, $value) {
    if (!file_exists($path)) {
        return false;
    }

    $escaped_value = escapeshellarg($value);

    $cmd = "exiftool -$key=$escaped_value \"$path\"";
    
    $res = exec($cmd);

    return trim($res) == "1 image files updated";
}

function exiftool_remove_value($path, $key, $value) {
    if (!file_exists($path)) {
        return false;
    }

    $escaped_value = escapeshellarg($value);

    $cmd = "exiftool -$key-=$escaped_value \"$path\"";
    
    $res = exec($cmd);

    return trim($res) == "1 image files updated";
}

function exiftool_add_value($path, $key, $value) {
    if (!file_exists($path)) {
        return false;
    }

    $escaped_value = escapeshellarg($value);

    $cmd = "exiftool -$key+=$escaped_value \"$path\"";
    
    $res = exec($cmd);

    return trim($res) == "1 image files updated";
}

function setImageCaption($path, $caption) {
    if (!file_exists($path)) {
        return false;
    }

    // needs to set the following groups/properties:
    // IPTC:Caption-Abstract

    $res = exiftool_set_value($path, "IPTC:Caption-Abstract", $caption);

    if ($res) {
        return true;
    } else {
        return false;
    }
}


function setImageDescription($path, $description) {
    if (!file_exists($path)) {
        return false;
    }

    // needs to set the following groups/properties:
    // EXIF:ImageDescription
    // XMP:Description

    
    $res1 = exiftool_set_value($path, "EXIF:ImageDescription", $description);
    $res2 = exiftool_set_value($path, "XMP:Description", $description);


    if ($res1 && $res2) {
        return true;
    } else {
        return false;
    }
}


function setImageAuthor($path, $author, $collection) {
    if (!file_exists($path)) {
        return false;
    }

    // needs to set the following groups/properties for author:
    // IPTC:By-line
    // EXIF:Artist
    // XMP:Creator

    // needs to set the following groups/properties for collection:
    // XMP:Subject
    // IPTC:Keywords


    $res1 = exiftool_set_value($path, "IPTC:By-line", $author);
    $res2 = exiftool_set_value($path, "EXIF:Artist", $author);
    $res3 = exiftool_set_value($path, "XMP:Creator", $author);

    if ($res1 && $res2 &&$res3) {
        return true;
    } else {
        return false;
    }
}

function removeImageTag($path, $value) {
    if (!file_exists($path)) {
        return false;
    }

    // needs to set the following groups/properties for collection:
    // XMP:Subject
    // IPTC:Keywords

    $res1 = exiftool_remove_value($path, "XMP:Subject", $value);
    $res2 = exiftool_remove_value($path, "IPTC:Keywords", $value);


    if ($res1 && $res2) {
        return true;
    } else {
        return false;
    }
}


function addImageTag($path, $value) {
    if (!file_exists($path)) {
        return false;
    }

    // needs to set the following groups/properties for collection:
    // XMP:Subject
    // IPTC:Keywords

    $res1 = exiftool_add_value($path, "XMP:Subject", $value);
    $res2 = exiftool_add_value($path, "IPTC:Keywords", $value);

    if ($res1 && $res2) {
        return true;
    } else {
        return false;
    }
}



function cacheMultipleVersionsOfImage($path, $md5) {
    $thumb_path = "/home/devhap/public_html/hamsa-images/_cache/${md5}.thumb.jpg";
    $image = new ImageResize($path);
    $image->quality_jpg = 75;
    $image->resizeToWidth(300);
    $image->save($thumb_path);

    // cache higher sized version as well.
    $med_path = "/home/devhap/public_html/hamsa-images/_cache/${md5}.med.jpg";
    $image = new ImageResize($path);
    $image->quality_jpg = 75;
    $image->resizeToWidth(800);
    $image->save($med_path);
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
}

function insertRecordForImage($path, $md5, $exif) {
    $record = ORM::for_table('image')->create();

    $record->set("path", $path);
    $record->set("checksum", $md5);
    $record->set_expr("date_modified", 'NOW()');
    $record->set("file_missing", false);
    $exif["Creator"] = getAuthor($exif);
    $record->set("metadata", json_encode($exif));

    $record->save();
}

function updateRecordForImage($path, $md5, $exif) {
    $record = ORM::for_table('image')->where("path", $path)->find_one();

    $record->set("path", $path);
    $record->set("checksum", $md5);
    $record->set_expr("date_modified", 'NOW()');
    $record->set("file_missing", false);
    $exif["Creator"] = getAuthor($exif);
    $record->set("metadata", json_encode($exif));

    $record->save();
}

function getAuthor($exif) {
    if (isset($exif["Creator"]) && !is_null($exif["Creator"])) return $exif["Creator"];
    
    $reducer = function($acc, $e) {
        if ($acc !== "") return $acc;
        
        if (strpos($e, 'Artist') !== false) {
            return str_replace("Artist ","", $e);
        }
    };

    if (isset($exif["keywords"])) {
        $v = array_reduce($exif["keywords"], $reducer, "");
        return $v;
    } else {
        return "";
    }
}

function recordNeedsUpdate($path, $md5, $rebuild) {
    $record = ORM::for_table('image')->where("path", $path)->find_one();

    if ($record) {
        if ($rebuild) {
            return "update";
        }

        if ((strcmp($record->checksum, $md5) == 0) && (file_exists($record->path))) {
            return "nothing";
        } else {
            return "update";
        }
    }

    return "insert";
}

function processImage($path, $rebuild) {
    error_log("processImage: $path");

    if (!file_exists($path)) {
        error_log("tried processing invalid path: $path");
        return false;
    }

    $md5 = md5_file($path);
    $thumb_path = "/home/devhap/public_html/hamsa-images/_cache/${md5}.thumb.jpg";
    $med_path = "/home/devhap/public_html/hamsa-images/_cache/${md5}.med.jpg";

    unset($exif);
    $cmd = exec("exiftool -json \"$path\"", $exif);

    $exifData = json_decode(implode($exif), true);
    // print_r($exifData);
    $exifData = reset($exifData);

    if (isset($exifData["keywords"])) {
        if (!is_array($exifData["keywords"])) {
            // print_r($exifData["keywords"]);
            $exifData["keywords"] = [$exifData["keywords"]];
            // die(1);
        }
    }

    switch (recordNeedsUpdate($path, $md5, $rebuild)) {
        case "update":
            updateRecordForImage($path, $md5, $exifData);
        break;
        case "insert":
            insertRecordForImage($path, $md5, $exifData);
        break;
        case "nothing":
        break;
    }
    
    if (!file_exists($thumb_path) ||!file_exists($med_path) ) {
        cacheMultipleVersionsOfImage($path, $md5);
    }

    insertArtistIfNeeded($exifData);

    $md5 = md5_file($path);
    return $md5;
}
