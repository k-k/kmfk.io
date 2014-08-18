<?php

use Phalcon\Mvc\Controller;

class IndexController extends Controller
{
    public function indexAction()
    {
        $this->tag->setTitle("KMFK");

        $this->assets
            ->addCss('css/index-temporary.css')
            ->addCss('//fonts.googleapis.com/css?family=Raleway:700', false);

    }

}
