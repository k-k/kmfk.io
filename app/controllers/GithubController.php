<?php

use Phalcon\Http\Response;
use Phalcon\Mvc\Controller;

class GithubController extends Controller
{
    public function repositoryAction($organization, $repository)
    {
        $github = $this->di->get('github_client');

        $repo = $github->api('repo')->show($organization, $repository);
        $info = [
            'id'          => $repo['id'],
            'name'        => $repo['name'],
            'description' => $repo['description'],
            'homepage'    => $repo['homepage'],
            'stars'       => $repo['stargazers_count'],
            'watchers'    => $repo['subscribers_count'],
            'forks'       => $repo['forks_count'],
            'issues'      => $repo['open_issues_count']
        ];

        $this->response->setHeader("Content-Type", "application/json");
        $this->response->setJsonContent($info);

        return $this->response;
    }
}
