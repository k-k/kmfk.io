kmfk.io
=======

Keith Kirk's personal site: a small [Express](https://expressjs.com) app on Node.js 20+.

## Running locally

```sh
npm install
npm run dev      # restarts on file changes
npm test
```

The site listens on `PORT` (default `8080`).

## Routes

| Path | What it does |
| --- | --- |
| `/` (also `/index`, `/index/index`) | Landing page. The mailto alias changes on each visit (tracked in an `email-counter` cookie). |
| `/blobs/show/:name` | Renders `content/blobs/:name.md` as HTML. Add a post by adding a markdown file there. |
| `/github/repository/:org/:repo` | JSON summary of a GitHub repository (stars, forks, watchers, open issues). |
| everything else | Static files from `public/`, otherwise 404. |

## Configuration

All optional, set as environment variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Port to listen on. |
| `STATIC_BASE_URL` | Prefix for CSS and images, e.g. `https://static.kmfk.io`. Empty serves them from `public/`. |
| `GITHUB_TOKEN` | Token for the GitHub proxy, to raise the API rate limit. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth app credentials, used instead of a token if `GITHUB_TOKEN` is unset. |

## Docker

```sh
docker build -t kmfk-io .
docker run -p 8080:8080 kmfk-io
```

## Deploying to DigitalOcean App Platform

The app spec lives in `.do/app.yaml`. It builds from the Dockerfile and redeploys on every push to `master`.

1. Create the app, either in the DigitalOcean control panel (Create App, pick this repo; it detects the spec) or with `doctl apps create --spec .do/app.yaml`.
2. Optionally set `GITHUB_TOKEN` as an encrypted env var in the app settings.
3. Point DNS for `kmfk.io` and `www.kmfk.io` at the app. See [docs/dns-cutover.md](docs/dns-cutover.md), which covers keeping the Google Workspace email records intact.
4. Once the new app serves traffic, the server running the old PHP site can be retired.
