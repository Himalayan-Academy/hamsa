<?php
if (PHP_SAPI == 'cli-server') {
    // To help the built-in PHP dev server, check if the request was actually for
    // something which should probably be served as a static file
    $url = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false;
    }
}
/*
select keyword, count(distinct (image_id, keyword))
from image, jsonb_array_elements(metadata->'keywords') keyword
group by keyword
order by count desc;

Keyword | count
...     | ...
*/

require_once __DIR__ . '/vendor/autoload.php';

// Load database configuration
require_once __DIR__ . '/src/database.php';

// Load hamsa auxiliary routines
require_once __DIR__ . '/src/hamsa.php';

use GraphQL\Type\Schema;
use GraphQL\Server\StandardServer;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\GraphQL;


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // header("Access-Control-Allow-Origin: *");
    // header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    // header('Access-Control-Allow-Headers: DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range');
 
   die('ok');
} else {

    $artistType = new ObjectType([
        'name' => 'Artist',
        'description' => 'Artist',
        'fields' => [
            'name' => [
                'type' => Type::string(),
                'resolve' => function($a) {
                    return $a["name"];
                }
            ],
            'description' => [
                'type' => Type::string(),
                'resolve' => function($a) {
                    return $a["metadata"]["description"];
                }
            ],
            'id' => [
                'type' => Type::int(),
                'resolve' => function($a) {
                    return $a["artist_id"];
                }
            ],
            'aliases' => [
                'type' => Type::listOf(Type::string()),
                'resolve' => function($a) {
                    return $a["metadata"]["aliases"];
                }
            ],
            'photo' => [
                'type' => Type::listOf(Type::string()),
                'resolve' => function($a) {
                    return $a["metadata"]["photo"];
                }
            ]
            
        ]
    ]);

    $metadataType = new ObjectType([
        'name' => 'Metadata',
        'description' => 'Metadata about an image',
        'fields' => [
            'artist' => [
                'type' => Type::string(),
                'resolve' => function($meta) {
                    return isset($meta["author"]) ? $meta["author"] : "";
                }
            ],
            'date' => Type::string(),
            'description' => [
                'type' => Type::string(),
                'resolve' => function($meta) {
                    return isset($meta["caption"]) ? $meta["caption"] : "" ;
                }
            ],
            'keywords' => [
                'type' => Type::listOf(Type::string()),
                'resolve' => function($meta) {
                    return isset($meta["keywords"]) ? $meta["keywords"] : [] ;
                }
            ],
            'more' => [
                'type' => Type::listOf(Type::string()),
                'resolve' => function($meta) {
                    if (!isset($meta["author"])) return [];
                    $r = image_get_all_by_artist($meta["author"], 8, 0);
                    $images = array_map(function ($image) {
                        return $image['checksum'];
                    }, $r);
                    return $images;
                }
            ]
        ]
    ]);

    $imageType = new ObjectType([
        'name' => 'Image',
        'description' => 'An image from HAMSA',
        'fields' => [
            'path' => [
                'type' => Type::string(),
                'resolve' => function ($image) {
                    return str_replace("/var/www/html", "", $image["path"]);
                }
            ],
            'thumbnail' => [
                'type' => Type::string(),
                'resolve' => function ($image) {
                    return "/images/_cache/${image['checksum']}.thumb.jpg";
                }
            ],
            'medpath' => [
                'type' => Type::string(),
                'resolve' => function ($image) {
                    return "/images/_cache/${image['checksum']}.med.jpg";
                }
            ],
            'width' => Type::int(),
            'height' => Type::int(),
            'checksum' => Type::string(),
            'date_modified' => Type::string(),
            'mime' => Type::string(),
            'metadata' => ['type' => $metadataType]
        ]
    ]);


    try {
        $queryType = new ObjectType([
            'name' => 'Query',
            'fields' => [

                'artists' => [
                    'type' => Type::listOf(Type::string()),
                    'description' => 'All artists present on the database',
                    'resolve' => function($root, $args) {
                        $func = function($e) {
                            return $e["author"];
                        };

                        $records = artist_get_all();
                        $records = array_map($func, $records);
                        return $records;
                    }
                ],
                'keywords' => [
                    'type' => Type::listOf(Type::string()),
                    'description' => 'All keywords present on the database',
                    'resolve' => function($root, $args) {
                        $stripQuotes = function($e) {
                            return str_replace('"', "", $e["keyword"]);
                        };

                        $filterCollections = function($e) {
                            if (!isset($e['keyword'])) return false;
                            return strpos(strtolower($e["keyword"]), 'collection') == false;
                        };

                        $filterArtists = function($e) {
                        return strpos(strtolower($e["keyword"]), 'artist') == false;
                        };

                        $records = keywords_get_all();
                        $records = array_filter($records, $filterCollections);
                        $records = array_filter($records, $filterArtists);
                        $records = array_map($stripQuotes, $records);
                        return $records;
                    }
                ],
                'collections' => [
                    'type' => Type::listOf(Type::string()),
                    'description' => 'All collections present on the database',
                    'resolve' => function($root, $args) {
                        $stripQuotesAndPrefix = function($e) {
                            $r = str_replace('"', "", $e["keyword"]);
                            $r = str_replace('Collection', "", $r);
                            $r = str_replace('collection', "", $r);
                            return $r;
                        };
                    
                        $filterCollections = function($e) {
                            if (!isset($e['keyword'])) return false;
                            return strpos(strtolower($e['keyword']), 'collection') == true;
                        };
                        

                        $records = keywords_get_all();
                        $records = array_filter($records, $filterCollections);
                        $records = array_map($stripQuotesAndPrefix, $records);
                        return $records;
                    }
                ],
                'count' => [
                    'type' => Type::int(),
                    'description' => 'Returns total number of items in collection',
                    'args' => [
                        'artist' => [
                            'type' => Type::string(),
                            'description' => 'Count images by artist',
                            'defaultValue' => ''
                        ],
                        'keyword' => [
                            'type' => Type::string(),
                            'description' => 'Count images by keyword',
                            'defaultValue' => ''
                        ]
                    ],
                    'resolve' => function($root, $args) {

                        $records = collection_count_results($args["keyword"], $args["artist"]);
                        return $records;
                    }
                ],
                'images' => [
                    'type' => Type::listOf($imageType),
                    'description' => "Queries the available images on the system",
                    'args' => [
                        'limit' => [
                            'type' => Type::int(),
                            'description' => 'Limit the number of images returned',
                            'defaultValue' => 10
                        ],
                        'offset' => [
                            'type' => Type::int(),
                            'description' => 'Offset from the start',
                            'defaultValue' => 0
                        ],
                        'artist' => [
                            'type' => Type::string(),
                            'description' => 'Filter images by artist',
                            'defaultValue' => ''
                        ],
                        'keyword' => [
                            'type' => Type::string(),
                            'description' => 'Filter images by keyword',
                            'defaultValue' => ''
                        ],
                        'query' => [
                            'type' => Type::string(),
                            'description' => 'Search term',
                            'defaultValue' => ''
                        ]

                    ],
                    'resolve' => function ($root, $args) {
                        if ($args["artist"] !== '' ) { 
                            $images = image_get_all_by_artist($args["artist"], $args["limit"], $args["offset"]);
                        } else if ($args["keyword"] !== '' ) {
                            $images = image_get_all_by_keyword($args["keyword"], $args["limit"], $args["offset"]);
                        } else if ($args["query"] !== '') {
                            $images = image_search($args["query"], $args["limit"], $args["offset"]);    
                        } else {
                            $images = image_get_all($args["limit"], $args["offset"]);
                        }

                        $images = array_filter($images, function ($image) {
                            return file_exists($image["path"]);
                        });
                        return $images;
                    }
                ],
                'image' => [
                    'type' => $imageType,
                    'description' => "Queries for a specific image",
                    'args' => [
                        'checksum' => [
                            'type' => Type::string(),
                            'description' => 'Checksum of the chose image',
                            'defaultValue' => 10
                        ]

                    ],
                    'resolve' => function ($root, $args) {
                        $image = image_get($args["checksum"]);
                        return $image[0];
                    }
                ]
            ],
        ]);

        $mutationType = NULL;

        // See docs on schema options:
        // http://webonyx.github.io/graphql-php/type-system/schema/#configuration-options
        $schema = new Schema([
            'query' => $queryType,
            'mutation' => $mutationType,
        ]);

        // See docs on server options:
        // http://webonyx.github.io/graphql-php/executing-queries/#server-configuration-options
        $server = new StandardServer([
            'schema' => $schema
        ]);

        $server->handleRequest();

    } catch (\Exception $e) {

        StandardServer::send500Error($e);

    }
}