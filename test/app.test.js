import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import config from '../src/config.js';
import { createApp } from '../src/app.js';

const fakeRepo = {
  id: 1,
  name: 'qpush-bundle',
  description: 'Push queues for Symfony',
  homepage: null,
  stargazers_count: 10,
  subscribers_count: 3,
  forks_count: 4,
  open_issues_count: 2,
};

const fakeFetch = async (url) => {
  if (url.endsWith('/uecode/qpush-bundle')) {
    return new Response(JSON.stringify(fakeRepo), { status: 200 });
  }
  return new Response('{}', { status: 404 });
};

let server;
let base;

before(async () => {
  server = createApp(config, { fetchImpl: fakeFetch }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

describe('home page', () => {
  it('renders the landing card', async () => {
    const res = await fetch(`${base}/`);
    const body = await res.text();

    assert.equal(res.status, 200);
    assert.match(body, /<title>Keith Kirk \/\/ KMFK<\/title>/);
    assert.match(body, /Hello, I'm Keith Kirk\./);
    assert.match(body, /href="mailto:hello@kmfk\.io"/);
    assert.match(body, /\/css\/kmfk\.css/);
  });

  it('cycles the email alias on each visit and wraps around', async () => {
    const seen = [];
    let cookie = '';
    for (let i = 0; i < 9; i++) {
      const res = await fetch(`${base}/`, { headers: { cookie } });
      cookie = res.headers.get('set-cookie').split(';')[0];
      seen.push((await res.text()).match(/mailto:([\w-]+)@/)[1]);
    }

    assert.deepEqual(seen, [
      'hello', 'hi', 'greetings', 'salutations', 'hola', 'i-dont-bite', 'email-me-already', 'hello', 'hi',
    ]);
  });

  it('is also served at /index', async () => {
    assert.equal((await fetch(`${base}/index`)).status, 200);
    assert.equal((await fetch(`${base}/index/index`)).status, 200);
  });
});

describe('blobs', () => {
  it('renders markdown posts', async () => {
    const res = await fetch(`${base}/blobs/show/qpush-bundle`);
    const body = await res.text();

    assert.equal(res.status, 200);
    assert.match(body, /<h2[^>]*>Getting Pushy with Symfony2!<\/h2>/);
    assert.match(body, /<pre><code class="language-php">/);
    assert.match(body, /github-flavored-markdown\.css/);
  });

  it('returns 404 for missing or unsafe names', async () => {
    const res = await fetch(`${base}/blobs/show/nope`);
    assert.equal(res.status, 404);
    assert.match(await res.text(), /You've just been 404'd\./);
    assert.equal((await fetch(`${base}/blobs/show/..%2Fpackage`)).status, 404);
  });
});

describe('github proxy', () => {
  it('returns a repository summary', async () => {
    const res = await fetch(`${base}/github/repository/uecode/qpush-bundle`);

    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      id: 1,
      name: 'qpush-bundle',
      description: 'Push queues for Symfony',
      homepage: null,
      stars: 10,
      watchers: 3,
      forks: 4,
      issues: 2,
    });
  });

  it('passes through a missing repository as 404', async () => {
    assert.equal((await fetch(`${base}/github/repository/nobody/nothing`)).status, 404);
  });
});

describe('static assets', () => {
  it('serves files from public/', async () => {
    const res = await fetch(`${base}/img/github-48.png`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/png');
  });

  it('returns the custom 404 page for unknown paths', async () => {
    const res = await fetch(`${base}/does/not/exist`);
    const body = await res.text();

    assert.equal(res.status, 404);
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.match(body, /You've just been 404'd\./);
    assert.match(body, /\/css\/404\.css/);
    assert.match(body, /<div class="overlay">/);
  });

  it('serves the 404 page assets', async () => {
    assert.equal((await fetch(`${base}/css/404.css`)).status, 200);
    assert.equal((await fetch(`${base}/img/giphy.gif`)).headers.get('content-type'), 'image/gif');
  });
});
