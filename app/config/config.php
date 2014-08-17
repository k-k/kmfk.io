<?php

use Phalcon\Config;

return new Config([
    'application' => [
        'baseUri'   => '/',
        'publicUrl' => 'kmfk.io',
        'cacheDir'  => APP_DIR . '/cache/',
        'viewsDir'  => APP_DIR . '/views/',
        'blobsDir'  => APP_DIR . '/blobs/'
    ],
    'github' => [
        'clientId' => '',
        'secret'   => ''
    ],
    'jms' => [
        'cacheDir' => APP_DIR . '/cache/jms',
        'debug'    => false
    ]
]);
