<?php

use Phalcon\Http\Response;
use Phalcon\Mvc\Controller;

class GithubController extends Controller
{
    public function repositoryAction($organization, $repository)
    {
        $github = $this->di->getGithub();

        $repo = $github->api('repo')->show($organization, $repository);
        $info = [
            'id'       => $repo['id'],
            'name'     => $repo['name'],
            'stars'    => $repo['stargazers_count'],
            'watchers' => $repo['subscribers_count'],
            'forks'    => $repo['forks_count'],
            'issues'   => $repo['open_issues_count']
        ];

        $response = new Response();

        $response->setHeader("Content-Type", "application/json");
        $response->setJsonContent($info);

        return $response;
    }
}
