var path = require('path')
  , through = require('through2')

module.exports = function (file, opts) {
  if (path.extname(file) !== '.js') {
    return through()
  }

  var data = ''

  return through(function (buf, enc, next) {
    data += buf
    next()
  }, function (next) {
    // Replace windows back slashes with forward slashes because browserify transform seem to choke with escaping correctly
    var f = (opts.stripCwd ? path.relative(process.cwd(), file) : file).replace(/\\/gi, '/')
    this.push(data)
    this.push(' \nif (module && module.exports) { module.exports.__filename__ = "' + f + '" }\n ')
    this.push(null)
    next()
  })
}
