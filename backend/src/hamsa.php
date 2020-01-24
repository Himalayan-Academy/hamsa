<?php
/**
 * Created by PhpStorm.
 * User: soapdog
 * Date: 9/8/2017
 * Time: 2:06 PM
 */

require_once __DIR__ . '/exif.php';

function check_credentials($email, $password) {
    if ($email !== "andre@andregarzia.com" && $password !== "alface") {
        return false;
    }

    return true;
}

/**
 * Image routines
 */

function image_get_all($limit, $offset) {
    // todo: add pagination
    $extract_metadata = function($value) {
        if (isset($value["metadata"])) {
            $value["metadata"] = json_decode($value["metadata"],true);
        }
        return $value;
    };

    $records = ORM::for_table('image')
        ->where('file_missing', false)
        ->limit($limit)
        ->offset($offset)
        ->order_by_expr("CHAR_LENGTH(metadata->>'caption')")
        ->find_array();

    return array_map($extract_metadata, $records);
}


function image_get_all_by_artist($artist, $limit, $offset) {
    // todo: add pagination
    $extract_metadata = function($value) {
        if (isset($value["metadata"])) {
            $value["metadata"] = json_decode($value["metadata"],true);
        }
        return $value;
    };

    $records = ORM::for_table('image')
        ->where('file_missing', false)
        ->where_raw("metadata->>'Creator' = ?", array($artist))
        ->limit($limit)
        ->offset($offset)
        ->find_array();



    return array_map($extract_metadata, $records);
}


function image_set_missing($id, $missing) {
    $record = ORM::for_table('image')->where('image_id', $id)->findOne();

    $record->set("file_missing", !$missing);
    $record->save();
}


function image_get($checksum) {

    $extract_metadata = function($value) {
        if (isset($value["metadata"])) {
            $value["metadata"] = json_decode($value["metadata"],true);
        }
        return $value;
    };

    $records = ORM::for_table('image')
        ->where('file_missing', false)
        ->where('checksum', $checksum)
        ->limit(1)
        ->find_array();

    return array_map($extract_metadata, $records);
}

function image_set_description($checksum, $description) {
    $image = image_get($checksum);
    $path = str_replace("/var/www/html", "", $image[0]["path"]);
    $res = setImageDescription($path, $description);
    processImage($path, true);
   
    return $res;
}

function image_add_tag($checksum, $tag) {
    $image = image_get($checksum);
    $path = str_replace("/var/www/html", "", $image[0]["path"]);
    $res = addImageTag($path, $tag);
    processImage($path, true);
   
    return $res;
}

function image_remove_tag($checksum, $tag) {
    $image = image_get($checksum);
    $path = str_replace("/var/www/html", "", $image[0]["path"]);
    $res = removeImageTag($path, $tag);
    processImage($path, true);
   
    return $res;
}


/**
 * Artist routines
 */


function artist_get_all() {
    // $extract_metadata = function($value) {
    //     if (isset($value["metadata"])) {
    //         $value["metadata"] = json_decode($value["metadata"],true);
    //     }
    //     return $value;
    // };

    // $records = ORM::for_table('artist')
    //     ->limit($limit)
    //     ->offset($offset)
    //     ->find_array();
    //
    // return array_map($extract_metadata, $records);

    $records = ORM::for_table('image')
        ->raw_query("select distinct metadata->>'Creator' as author from image where metadata->>'Creator' IS NOT NULL")
        ->find_array();

    return $records;
}



function artist_get($alias) {

    $extract_metadata = function($value) {
        if (isset($value["metadata"])) {
            $value["metadata"] = json_decode($value["metadata"],true);
        }
        return $value;
    };

    $records = ORM::for_table('artist')
        ->raw_query("SELECT * FROM artist WHERE name LIKE :alias OR   jsonb_exists(artist.metadata->'aliases', :alias) LIMIT 1", array('alias' => $alias))
        ->find_array();

    if (count($records) >= 1) {    
        $records = $records[0];
    }

    return array_map($extract_metadata, $records);
}

function artist_exists($alias) {
    $artist = artist_get($alias);

    if (isset($artist["artist_id"])) {
        return true;
    } else {
        return false;
    }
}




/**
 * Collection routines
 */


function collection_get_all() {
    // todo: add pagination
    $records = ORM::for_table('collection')
        ->find_array();
    return $records;
}

function keywords_get_all() {
    $query = <<<QUERY
    select 
        keyword, count(distinct (image_id, keyword)) 
    from 
        image, 
        jsonb_array_elements(case jsonb_typeof(metadata->'Keywords') when 'array' then metadata->'Keywords'else '[]' end) keyword 
    group by 
        keyword 
    order by 
        count desc
QUERY;
  
    $records = ORM::for_table('image')  
        ->raw_query($query)
        ->find_array();

    return $records;
}


function collection_count_results($keyword, $artist ) {
    
    if ($keyword !== '') {
        $count = ORM::for_table('image')
            ->raw_query("select count(path) from image where file_missing = false and jsonb_exists(metadata->'Keywords',?);", Array($keyword))
            ->find_array();
    } 
    
    if ($artist !== '') {
        $count = ORM::for_table('image')
        ->raw_query("select count(path) from image where file_missing = false and metadata->>'Creator' = ?;", Array($artist))
        ->find_array();
    }

    if ($artist == '' && $keyword == '') {
        $count = ORM::for_table('image')
        ->raw_query("select count(path) from image where file_missing = false;")
        ->find_array();
    }
    return  $count[0]['count'];
}

function image_get_all_by_keyword($keyword, $limit, $offset) {
    $extract_metadata = function($value) {
        if (isset($value["metadata"])) {
            $value["metadata"] = json_decode($value["metadata"],true);
        }
        return $value;
    };

    $records = ORM::for_table('image')
        ->raw_query("select * from image where file_missing = false and jsonb_exists(metadata->'Keywords',?) LIMIT ? OFFSET ?;", Array($keyword, $limit, $offset))
        ->find_array();

    return array_map($extract_metadata, $records);
}

function image_search($query, $limit, $offset) {
    // todo: add pagination
    $extract_metadata = function($value) {
        if (isset($value["metadata"])) {
            $value["metadata"] = json_decode($value["metadata"],true);
        }
        return $value;
    };

    $records = ORM::for_table('image')
        ->raw_query("select * from image where file_missing = false and metadata::text ILIKE ?;", Array("%$query%"))
        ->find_array();

    return array_map($extract_metadata, $records);
}


/**
 * Tags routines
 */


function tag_get_all() {
    // todo: add pagination
    $records = ORM::for_table('tag')
        ->find_array();
    return $records;
}
