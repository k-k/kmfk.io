<?php

use Phalcon\DI\FactoryDefault;
use Phalcon\Exception;
use Phalcon\Loader;
use Phalcon\Mvc;


try {

    require_once __DIR__ . "/../vendor/autoload.php";

    $di = new FactoryDefault();

    $di->set('view', function() {
        $view = new Mvc\View();
        $view->setViewsDir('../app/views/');

        return $view;
    });

    $di->set('url', function() {
        $url = new \Mvc\Url();
        $url->setBaseUri('/');

        return $url;
    });

    $di->set('github', function() {

        return new \Github\Client();
    }, true);

    $application = new Mvc\Application($di);

    echo $application->handle()->getContent();

} catch(\Phalcon\Exception $e) {
     echo "PhalconException: ", $e->getMessage();
}
