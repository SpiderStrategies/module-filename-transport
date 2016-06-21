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
    var f = file.replace(/\\/gi, '\\\\')
    this.push(data)
    this.push(' \nmodule.exports.__filename__ = "' + (opts.stripCwd ? path.relative(process.cwd(), f) : f) + '"\n ')
    this.push(null)
    next()
  })
}
