<?php

use Phalcon\Exception;
use Phalcon\Mvc\Application;

try {

    define('BASE_DIR', dirname(__DIR__));
    define('APP_DIR', BASE_DIR . '/app');

    /**
     * Use composer's autoloader
     */
    require_once BASE_DIR . "/vendor/autoload.php";

    /**
     * Read the configuration
     */
    $config = include APP_DIR . '/config/config.php';

    /**
     * Read services
     */
    include APP_DIR . '/config/services.php';

    $application = new Application($di);

    echo $application->handle()->getContent();

} catch(\Phalcon\Exception $e) {
     echo "PhalconException: ", $e->getMessage();
}
