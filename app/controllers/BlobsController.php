<?php

use Phalcon\Http\Response;
use Phalcon\Mvc\Controller;

class BlobsController extends Controller
{
    public function showAction($name)
    {
        $parser   = $this->di->get('php_markdown');
        $filename = $this->di->getConfig()->application->blobsDir . "{$name}.md";

        if (!file_exists($filename)) {
            $this->response->setStatusCode(404, "Not Found")->sendHeaders();

            return $this->response;
        }

        $this->assets
            ->addCss('css/github-flavored-markdown.css');

        $html = $parser->transform(file_get_contents($filename));

        $this->view->setVars([
            'blob' => $html
        ]);
    }
}
