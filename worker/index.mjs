/**
 * Siqli
 * ============================================
 * - CLI URL shortener
 * - Cloudflare Workers URL redirector
 * - Simple homepage/404 page
 * - Private links list page
 * 
 * Copyright 2022 Siqli (https://siq.li)
 * 
 * SPDX-License-Identifier: Jam
 */

// Import redirects
import redirects from "./redirects.json"

// Import HTML
import homepage from "./index.html"
import notfound from "./notfound.html"

// Standard Response headers
const headers = new Headers({
  'Referrer-Policy': 'no-referrer',
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Feature-Policy': 'none',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Robots-Tag': 'index, follow, noarchive, nosnippet, notranslate',
  'Content-Security-Policy': "base-uri 'self'; script-src 'none'; style-src 'nonce-8a7f25cd6e9b'; img-src 'self'; object-src 'none'; frame-ancestors 'none';",
  'Siqli-Version': 'v2.2.3',
  'Cache-Control': 'public, min-fresh=3600, max-age=86400, s-maxage=86400'
})

//
export default {
  fetch({ method, url }, env) {

          // Slice `/` from pathname
    const path = new URL(url).pathname.slice(1),
          // Does URL start with `www.`?
          www = new URL(url).hostname.startsWith('www.')
          // The isn't required if www -> non-www redirect is handle by
          // Cloudflare through a page rule.
    
    // Only accept GET and HEAD
    if (method !== "GET" && method !== "HEAD") {
      headers.append('Allow', "GET, HEAD")
      headers.set('Cache-Control', 'public, min-fresh=86400, max-age=604800, s-max-age=604800, must-revalidate, must-understand')
      return new Response("Method Not Allowed", {
        status: 405,
        headers,
      })
    }

    // Handle redirects as first priority
    if (redirects.hasOwnProperty(path) && www !== true) {
      headers.set('Cache-Control', 'public, min-fresh=3600, max-age=86400, s-maxage=86400, must-revalidate, must-understand')
      headers.append('Location', redirects[path])
      return new Response(null, {
        status: 301,
        headers,
      })
    }

    // Serve homepage
    if (path === "") {
      headers.set('Cache-Control', 'public, min-fresh=3600, max-age=86400, s-maxage=86400, must-revalidate, must-understand')
      headers.append('Content-Type', 'text/html;charset=utf-8')
      headers.append('Link', `<${new URL(url).origin}>; rel="canonical"`)
      return new Response(homepage, {
        headers,
      })
    }

    // Private link list page
    if (env.LINKS_PAGE && path === env.LINKS_PAGE) {
      headers.append('Content-Type', 'text/html;charset=utf-8')
      headers.set('Cache-Control', 'no-store')
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta name="viewport" content="width=device-width"><title>Links List</title><style nonce="8a7f25cd6e9b">body{font-family:monospace;font-size:100%}li{font-size:1.25rem}</style></head><body><h1>Link List</h1><ul>${Object.entries(redirects).map(([code,link]) => `<li><a href="/${code}"><b>${code}</b></a> &raquo; ${link}</li>`).join('')}</ul></body></html>`, {
        headers,
      })
    }

    // This isn't necessary, but...
    if (path === "favicon.ico") {
      headers.set('Cache-Control', 'public, min-fresh=86400, max-age=604800, s-maxage=604800, must-revalidate, must-understand')
      return new Response(null, {
        status: 204,
        headers,
      })
    }

    // Show 404 for all other requests
    headers.append('Content-Type', 'text/html;charset=utf-8')
    return new Response(notfound, {
      status: 404,
      headers,
    })
  }
}
