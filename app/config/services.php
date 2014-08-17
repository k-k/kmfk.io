<?php

use Github\Client;
use JMS\Serializer\SerializerBuilder;
use Michelf\MarkdownExtra;
use Phalcon\DI\FactoryDefault;
use Phalcon\Mvc\Url;
use Phalcon\Mvc\View;
use Phalcon\Mvc\View\Engine\Volt;
use Phalcon\Session\Adapter\Files as SessionAdapter;

/**
 * The FactoryDefault Dependency Injector automatically register the right services providing a full stack framework
 */
$di = new FactoryDefault();

/**
 * Register the global configuration as config
 */
$di->set('config', $config);

/**
 * Setting up the view component
 */
$di->set('view', function() use($config) {
    $view = new View();
    $view->setViewsDir($config->application->viewsDir);

    $view->registerEngines(array(
        '.volt' => function ($view, $di) use ($config) {

            $volt = new Volt($view, $di);

            $volt->setOptions(array(
                'compiledPath' => $config->application->cacheDir . 'volt/',
                'compiledSeparator' => '_'
            ));

            return $volt;
        }
    ));

    return $view;
}, true);

/**
 * The URL component is used to generate all kind of urls in the application
 */
$di->set('url', function() use($config) {
    $url = new Url();
    $url->setBaseUri($config->application->baseUri);

    return $url;
}, true);

/**
 * Start the session the first time some component request the session service
 */
$di->set('session', function () {
    $session = new SessionAdapter();
    $session->start();
    return $session;
});

/**
 *  Add the Github client
 */
$di->set('github_client', function() use($config) {
    $client = new Client();
    $client->authenticate(
        $config->github->clientId,
        $config->github->secret,
        Client::AUTH_URL_CLIENT_ID
    );

    return $client;
}, true);

/**
 * Add the Markdown Parser
 */
$di->set('php_markdown', function() {
    return new MarkdownExtra;
}, true);

/**
 * Add the JMS Serializer
 */
$di->set('jms_serializer', function() use($config) {
    $serializer = SerializerBuilder::create()
        ->setCacheDir($config->jms->cacheDir)
        ->setDebug($config->jms->debug)
        ->build();
}, true);
