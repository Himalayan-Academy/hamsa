<?php
// Routes

$app->post('/test', function($request, $response, $args) {

    
    $uploadedFiles = $request->getUploadedFiles();

    if (isset($uploadedFiles["file"])) {   
        $uploadedFiles["file"]->moveTo("/tmp/test.jpg");

        //
        $reader = \PHPExif\Reader\Reader::factory(\PHPExif\Reader\Reader::TYPE_EXIFTOOL);

        $exif = $reader->read("/tmp/test.jpg");

        $data = $exif->getData();
    } else {
        $data = array();
    }

    return $this->renderer->render($response, 'test.phtml', $data);
});

$app->get('/dbtest', function($request, $response, $args) {

    $dbname = getenv("POSTGRES_DB");
    $dbpassword = getenv("POSTGRES_PASSWORD");
    $dbuser = getenv("POSTGRES_USER");

    ORM::configure("pgsql:host=database;dbname=${dbname}");
    ORM::configure('username', $dbuser);
    ORM::configure('password', $dbpassword);
    ORM::configure('id_column_overrides', array(
        'image' => 'image_id',
        'collection' => 'collection_id',
        'tag' => 'tag_id',
        'artist' => 'artist_id'
    ));

    $data = ORM::for_table('image')->find_array();
    
    return $this->renderer->render($response, 'test.phtml', $data);
});

$app->get('/test', function($request, $response, $args) {

    return $this->renderer->render($response, 'test.phtml');
});


$app->get('/[{name}]', function ($request, $response, $args) {
    // Sample log message
    $this->logger->info("Slim-Skeleton '/' route");

    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

