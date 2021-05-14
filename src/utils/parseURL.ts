export function parseURL(url: string, login?: string, pass?: string) {
  const parsedUrl = new URL(url);

  const { href, host, protocol, username, password } = parsedUrl;
  let hrefWithCredentials = `${protocol}//${login || username}:${pass || password}@${host}${href.split(host).slice(1).join(host)}`;
  let hrefWithNoCredentials = `${protocol}//${host}${href.split(host).slice(1).join(host)}`;

  if(!url.endsWith('/')) {
    hrefWithCredentials = hrefWithCredentials.replace(/\/+$/, '');
    hrefWithNoCredentials = hrefWithNoCredentials.replace(/\/+$/, '');
  }

  return {
    ...parsedUrl,
    hrefWithCredentials,
    hrefWithNoCredentials,
  };
}
