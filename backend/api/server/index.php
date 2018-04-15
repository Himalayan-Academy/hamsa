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


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: content-type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    die("ok");
}

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


$artistType = new ObjectType([
    'name' => 'Artist',
    'description' => 'Artist',
    'fields' => [
        'author' => [
            'type' => Type::string(),
            'resolve' => function($a) {
                return $a["author"];
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
                return $meta["keywords"];
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
                'type' => Type::listOf($artistType),
                'description' => 'All artists present on the database',
                'resolve' => function($root, $args) {
                    return artist_get_all();
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
                    ]

                ],
                'resolve' => function ($root, $args) {
                    $images = image_get_all($args["limit"], $args["offset"]);
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