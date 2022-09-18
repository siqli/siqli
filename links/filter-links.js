/**
 * filter-links.js
 * - Filter out disabled links before building/publishing worker
 * 
 * SPDX-License-Identifier: Jam
 */
const { writeFileSync } = require('fs')
const linklist = require(`${__dirname}/link-list.json`)
const redirects = {}

// Filter disabled links
const filtered = Object.entries(linklist)
      .filter(e => !e[0].startsWith('!'))
      .forEach(([k, v]) => redirects[k] = v)

// Redirects for worker
writeFileSync('./worker/redirects.json', JSON.stringify(redirects), 'utf-8')
