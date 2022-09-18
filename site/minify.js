/**
 * Minify HTML pages
 */
const minify = require('html-minifier').minify;
const fs = require('fs')
 
// Read files, filter out non-HTML
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'))

// Loop through files
files.forEach(f => {
  
  // Read file
  const content = fs.readFileSync(`${__dirname}/${f}`).toString()

  // Minify content
  const minified = minify(content, {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    html5: true,
    removeComments: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,
  });

  // Write out
  fs.writeFileSync(`./worker/${f}`, minified)
})
