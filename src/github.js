/**
 * Fetches a repository from the GitHub API and returns the same summary the PHP site did.
 * Credentials are optional and only raise the API rate limit.
 */
export async function fetchRepository(organization, repository, { token, clientId, secret }, fetchImpl = fetch) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'kmfk.io',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (clientId && secret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`;
  }

  const url = `https://api.github.com/repos/${encodeURIComponent(organization)}/${encodeURIComponent(repository)}`;
  const response = await fetchImpl(url, { headers });

  if (!response.ok) {
    const error = new Error(`GitHub API responded with ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const repo = await response.json();

  return {
    id: repo.id,
    name: repo.name,
    description: repo.description,
    homepage: repo.homepage,
    stars: repo.stargazers_count,
    watchers: repo.subscribers_count,
    forks: repo.forks_count,
    issues: repo.open_issues_count,
  };
}
