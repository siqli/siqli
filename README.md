# Siqli

- Simple homepage.
- Short URL generator
- URL Redirector

## `package.json` Config

Configuration in this is used for `links/add.js` as is the `homepage`. Configure per requirements.

## Private Links Page

Set a `LINKS_PAGE` environment variable in the `wrangler.toml`, Cloudflare UI, or Wrangler CLI.

Set the `routes` for the worker in the `wrangler.toml`.

## Add Redirect URL

Run `node links/add [URL]` or `node links/add [URL] [CODE]`. This adds a new key/value to `links/link-list.json`. Disable a link *(without removing it)* by appending a `!` to the beginning of the key. These values are skipped when `links/filter-links.js` builds `redirects.json` for the worker.

## Home/404 Pages

Basic HTML pages. HTML-minifier used prior to inclusion in the worker.

## License

[Jam License](LICENSE)
