<?php
// Routes


$app->get('/images', function($request, $response) {
    $data = image_get_all();
    return $response->withJson($data);
});


