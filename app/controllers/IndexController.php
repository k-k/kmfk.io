<?php

use Phalcon\Assets\Filters\CssMin;
use Phalcon\Mvc\Controller;

class IndexController extends Controller
{
    public function indexAction()
    {
        $this->tag->setTitle("Keith Kirk // KMFK");

        $emails = [
            'hello',
            'hi',
            'greetings',
            'salutations',
            'hola',
            'i-dont-bite',
            'email-me-already'
        ];

        $counter = 0;
        if ($this->session->has('email-counter')) {
            $counter = $this->session->get('email-counter');
        }

        if ($counter < sizeof($emails)) {
            $this->session->set('email-counter', $counter + 1);
        } else {
            $counter = 0;
            $this->session->set('email-counter', $counter + 1);
        }

        $this->assets
            ->collection('header-css')
            ->setPrefix('http://static.kmfk.io/')
            ->setTargetPath('css/kmfk.css')
            ->setTargetUri('css/kmfk.css')
            ->addCss('css/index-temporary.css')
            ->addCss('css/animate.css')
            ->addCss('http://fonts.googleapis.com/css?family=Raleway:700', false, false)
            ->join(true)
            ->addFilter(new CssMin());

        $this->view->setVars(['email' => $emails[$counter]]);
    }

}
