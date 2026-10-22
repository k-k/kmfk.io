const escape = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function layout({ title, styles, content }) {
  const links = styles.map((href) => `<link rel="stylesheet" type="text/css" href="${escape(href)}" />`).join('\n        ');

  return `<!DOCTYPE html>
<html>
    <head>
        <title>${escape(title)}</title>
        <link rel="shortcut icon" href="/img/favicon-blue.ico" type="image/x-icon">
        <link rel="icon" href="/img/favicon-blue.ico" type="image/x-icon">
        ${links}
    </head>
    <body>
        ${content}
    </body>
</html>
`;
}

export function indexPage({ email, staticBaseUrl }) {
  const asset = (p) => `${staticBaseUrl}${p}`;

  return layout({
    title: 'Keith Kirk // KMFK',
    styles: [asset('/css/kmfk.css'), 'https://fonts.googleapis.com/css?family=Raleway:700'],
    content: `<div id="content">
    <h1 class="hello">Hello, I'm Keith Kirk.</h1>
    <h3 class="title">A full stack Software Engineer</h3>
    <a class="email" href="mailto:${escape(email)}@kmfk.io"><span class="animated pulse">${escape(email)}</span>@kmfk.io</a>
    <br />
    <div class="icons">
        <a href="https://github.com/kmfk" target="_blank"><img src="${asset('/img/github-48.png')}" /></a>
        <a href="http://stackoverflow.com/users/396318/kmfk" target="_blank"><img src="${asset('/img/stackoverflow-48.png')}" /></a>
        <a href="http://www.linkedin.com/pub/keith-kirk/a1/a10/71a" target="_blank"><img src="${asset('/img/linkedin-48.png')}" /></a>
        <a href="https://twitter.com/kmfk" target="_blank"><img src="${asset('/img/twitter-48.png')}" /></a>
    </div>
</div>`,
  });
}

// `html` is trusted output from the markdown renderer of files in content/blobs.
export function blobPage({ html, staticBaseUrl }) {
  return layout({
    title: 'Keith Kirk // KMFK',
    styles: [`${staticBaseUrl}/css/github-flavored-markdown.css`],
    content: `<div>
${html}
</div>`,
  });
}

export function notFoundPage({ staticBaseUrl }) {
  return layout({
    title: 'Keith Kirk // 404!',
    styles: [`${staticBaseUrl}/css/index-temporary.css`, `${staticBaseUrl}/css/404.css`],
    content: `<div id="content">
    <img src="${staticBaseUrl}/img/giphy.gif" />
    <h1>You've just been 404'd.</h1>
</div>`,
  });
}
