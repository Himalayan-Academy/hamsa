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
require __DIR__ . '/../src/hamsa.php';

$stripQuotesAndPrefix = function($e) {
  $r = str_replace('"', "", $e["keyword"]);
  $r = str_replace('Collection ', "", $r);
  $r = str_replace('collection ', "", $r);
  return $r;
};

$filterCollections = function($e) {
  if (!isset($e['keyword'])) {
      return false;
  }

  if (in_array(trim($e['keyword']), array("Collection", "collection"))) {
      return false; 
  }

  return strpos(strtolower($e['keyword']), 'collection') == true;
};


$records = keywords_get_all();
$records = array_filter($records, $filterCollections);
$records = array_map($stripQuotesAndPrefix, $records);
print_r($records);