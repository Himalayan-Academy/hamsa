<?php
// Routes

$app->post('/test', function($request, $response, $args) {

    
    $uploadedFiles = $request->getUploadedFiles();

    if (isset($uploadedFiles["file"])) {   
        $uploadedFiles["file"]->moveTo("/mnt/c/Users/soapdog/kauai/hamsa/slim/public/images/uploads/test.jpg");

        //
        $reader = \PHPExif\Reader\Reader::factory(\PHPExif\Reader\Reader::TYPE_NATIVE);

        $exif = $reader->read("/mnt/c/Users/soapdog/kauai/hamsa/slim/public/images/uploads/test.jpg");

        $data = $exif->getData();
    } else {
        $data = array();
    }

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

