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
        <script>
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init Br Vr ci Wr Jr zr qr capture Ni calculateEventProperties Xr register register_once register_for_session unregister unregister_for_session es getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Zr Yr createPersonProfile ts Nr rs opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Kr debug O Qr getPageViewId captureTraceFeedback captureTraceMetric Dr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_sCCIKvpBUErZ1bpHCY7lpdWtZAhLO32eyBRE1DEn1Pi', {
                api_host: 'https://us.i.posthog.com',
                defaults: '2025-11-30',
                person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
            })
        </script>
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
    styles: [`${staticBaseUrl}/css/index-temporary.css`, `${staticBaseUrl}/css/404.css`, 'https://fonts.googleapis.com/css?family=Raleway:700'],
    content: `<div id="content">
    <div class="overlay">&nbsp;</div>
    <h1>You've just been 404'd.</h1>
</div>`,
  });
}
