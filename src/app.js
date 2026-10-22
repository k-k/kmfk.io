import { readFile } from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import { marked } from 'marked';
import defaultConfig from './config.js';
import { fetchRepository } from './github.js';
import { blobPage, indexPage } from './views.js';

const EMAILS = ['hello', 'hi', 'greetings', 'salutations', 'hola', 'i-dont-bite', 'email-me-already'];
const EMAIL_COOKIE = 'email-counter';

function readCounter(req) {
  const match = (req.headers.cookie || '').match(/(?:^|;\s*)email-counter=(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function createApp(config = defaultConfig, { fetchImpl } = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.use(express.static(config.publicDir, { index: false }));

  // Each visit shows the next mailto alias, cycling through EMAILS (was a PHP session counter).
  const index = (req, res) => {
    let counter = readCounter(req);
    if (counter >= EMAILS.length) {
      counter = 0;
    }

    res.cookie(EMAIL_COOKIE, String(counter + 1), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    res.type('html').send(indexPage({ email: EMAILS[counter], staticBaseUrl: config.staticBaseUrl }));
  };

  // Phalcon's default router also resolved /index and /index/index to the home page.
  app.get(['/', '/index', '/index/index'], index);

  app.get('/blobs/show/:name', async (req, res, next) => {
    const { name } = req.params;
    if (!/^[\w-]+$/.test(name)) {
      return res.status(404).end();
    }

    let markdown;
    try {
      markdown = await readFile(path.join(config.blobsDir, `${name}.md`), 'utf8');
    } catch (err) {
      return err.code === 'ENOENT' ? res.status(404).end() : next(err);
    }

    res.type('html').send(blobPage({ html: marked.parse(markdown), staticBaseUrl: config.staticBaseUrl }));
  });

  app.get('/github/repository/:organization/:repository', async (req, res) => {
    try {
      const info = await fetchRepository(req.params.organization, req.params.repository, config.github, fetchImpl);
      res.json(info);
    } catch (err) {
      const status = err.status === 404 ? 404 : 502;
      res.status(status).json({ error: err.message });
    }
  });

  app.use((req, res) => {
    res.status(404).type('text').send('Not Found');
  });

  return app;
}
