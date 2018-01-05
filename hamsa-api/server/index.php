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


header("Access-Control-Allow-Origin: *");

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


$metadataType = new ObjectType([
    'name' => 'Metadata',
    'description' => 'Metadata about an image',
    'fields' => [
        'artist' => Type::string(),
        'date' => Type::string(),
        'description' => Type::string(),
    ]
]);

$imageType = new ObjectType([
    'name' => 'Image',
    'description' => 'An image from HAMSA',
    'fields' => [
        'path' => [
            'type' => Type::string(),
            'resolve' => function($image) {
                return str_replace("/var/www", "", $image["path"]);
            }
        ],
        'thumbnail' => [
            'type' => Type::string(),
            'resolve' => function($image) {
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
    $queryType =  new ObjectType([
        'name' => 'Query',
        'fields' => [
            'echo' => [
                'type' => Type::string(),
                'args' => [
                    'message' => ['type' => Type::string()],
                ],
                'resolve' => function ($root, $args) {
                    return $root['prefix'] . $args['message'];
                }
            ],
            'images' => [
                'type' => Type::listOf($imageType),
                'resolve' => function ($root, $args) {
                    $images = image_get_all();
                    return $images;
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