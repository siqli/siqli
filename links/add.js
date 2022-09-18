#!/usr/bin/env node
//
// add.js
//
// SPDX-License-Identifier: Jam
//
const { readFileSync, writeFileSync, existsSync } = require('fs')
const { spawn } = require('child_process')
const { platform } = require('os')
const pkg = require('../package.json')

// Strip trailing slash from homepage if it exists
const homepage = pkg.homepage.endsWith('/') ? pkg.homepage.slice(0, -1) : pkg.homepage
// Use `package.json` for config
const {
  charset,
  codeLength,
  reservedWords,
} = pkg.config

// Short code generator
const short_code = (lngth = codeLength, chars = charset) => {

  if (lngth === null || chars === null)
    throw new Error("Invalid length or character set")

  let code = ''
  for(let i = 0; i < lngth; i++) {
    let tmp = 0
    while (i === 0 && !Number.isNaN(Number(tmp))) {
      tmp = chars.charAt(Math.floor(Math.random() * chars.length))
    } 
    code += (i === 0) ? tmp : chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

/**
* Go...
*/
// This is the file read/written
const redirects_file = `${__dirname}/link-list.json`

// Long URL to add
const addURL = process.argv[2]

// URL missing
if (addURL === undefined) {
  console.error("Missing URL!")
  process.exit()
}

// Make everything secure
// Remove if wanting non-secure, or alternate schemes (e.g. `app://`)
if (addURL.startsWith('https://') !== true) {
  console.error("Link must start with `https://`")
  process.exit()
}

// Custom short code or generate
const shortCode = process.argv[3] || short_code()

// Check if code is a reserved word
if ( reservedWords.includes(shortCode.toLowerCase()) ) {
  console.error("`%s` is a reserved word", shortCode)
  process.exit()
}

// If file exists (it should!) read it.
if (existsSync(redirects_file)) {

  // Read redirects file
  const links = JSON.parse(readFileSync(redirects_file, 'utf-8'))
  
  if (links.hasOwnProperty(shortCode)) {
    console.log("Code `%s` already exists.", shortCode)
    process.exit()
  }
  
  if (links.hasOwnProperty(`!${shortCode}`)) {
    console.log("Code `%s` is disabled.", shortCode)
    process.exit()
  }

  if (Object.values(links).includes(addURL)) {
    console.log("URL `%s` already exists.", addURL)
    process.exit()
  }

  // With with/out trailing `/`
  let testTwo = addURL.endsWith('/') ? addURL.slice(0, -1) : addURL.concat('/')
  if (Object.values(links).includes(testTwo)) {
    console.log("URL `%s` already exists.", testTwo)
    process.exit()
  }

  // No exit, so add new link
  links[shortCode] = addURL

  // Write links back to file
  writeFileSync(
    redirects_file,
    // pretty format
    JSON.stringify(links, null, '  ').concat('\n'),
    "utf-8"
  )

}
// First run, or file deleted
else {
  console.log("No redirects file, will attempt to create.")
  // Write links back to file
  writeFileSync(
    redirects_file,
    JSON.stringify({[shortCode]: addURL}),
    "utf-8"
  )
}

// Copy to clipboard (this is macOS specific.)
// Don't use Windows (at all) or Linux (much).
if (platform() === "darwin") {
  const pb = spawn('pbcopy')
  pb.stdin.write(`${homepage}/${shortCode}`)
  pb.stdin.end()
  // Log to console
  console.log(`${homepage}/${shortCode} copied to clipboard.`)
}
