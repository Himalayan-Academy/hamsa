<?php
/**
 * Created by PhpStorm.
 * User: soapdog
 * Date: 9/8/2017
 * Time: 2:06 PM
 */

/**
 * Account routines
 */

function account_new($email, $password_hash) {
    $record = ORM::for_table('account')->create();

    $record->set("email", $email);
    $record->set("password", $password_hash);
    $record->set("is_active", true);
    $record->save();
}

function account_set_active($email, $active) {
    $record = ORM::for_table('account')->where('email', $email)->findOne();

    $record->set("is_active", $active);
    $record->save();
}

function account_exists($email) {
    $record = ORM::for_table('account')->where('email', $email)->where('is_active', true)->findOne();

    if ($record) {
        return true;
    } else {
        return false;
    }
}

function account_get_all() {
    $records = ORM::for_table('account')->find_array();
    return $records;
}

function account_get_by_email($email) {
    $record = ORM::for_table('account')->where('email', $email)->find_array();
    return $record;
}

/**
 * Image routines
 */

function image_get_all($limit, $offset) {
    // todo: add pagination



    $extract_metadata = function($value) {
        $value["metadata"] = json_decode($value["metadata"],true);
        return $value;
    };

    $records = ORM::for_table('image')
        ->where('file_missing', false)
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
        $value["metadata"] = json_decode($value["metadata"],true);
        return $value;
    };

    $records = ORM::for_table('image')
        ->where('file_missing', false)
        ->where('checksum', $checksum)
        ->limit(1)
        ->find_array();

    return array_map($extract_metadata, $records);
}


/**
 * Artist routines
 */


function artist_get_all() {
    // todo: add pagination
    $records = ORM::for_table('artist')
        ->find_array();
    return $records;
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

/**
 * Tags routines
 */


function tag_get_all() {
    // todo: add pagination
    $records = ORM::for_table('tag')
        ->find_array();
    return $records;
}

