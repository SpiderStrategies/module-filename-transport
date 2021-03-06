var fs = require('fs')
  , transform = require('./')
  , path = require('path')
  , test = require('tape').test
  , Readable = require('stream').Readable

function rs () {
  var rs = new Readable

  rs._read = function (){
    rs.push('module.exports = function () {}')
    rs.push(null)
  }
  return rs
}

test('ignores non-js files', function (t) {
  var data = ''
  rs().pipe(transform('foo.hbs'))
      .on('data', function (d) {
        data += d
      })
      .on('end', function () {
        t.equal(data, 'module.exports = function () {}', 'file untouched')
        t.end()
      })
})

test('appends full path as __filename__ on module.exports', function (t) {
  var data = ''
    , filename = path.join(process.cwd(), 'foo.js')

  rs().pipe(transform(filename, {}))
      .on('data', function (d) {
        data += d
      })
      .on('end', function () {
        t.equal(data, 'module.exports = function () {} \nif (module && module.exports) { module.exports.__filename__ = "' + filename + '" }\n ', '__filename__ exported')
        t.end()
      })
})

test('strips cwd from filename export', function (t) {
  var data = ''
    , out = path.join('scripts', 'foo.js')

  rs().pipe(transform(path.join(process.cwd(), 'scripts', 'foo.js'), {
        stripCwd: true
      }))
      .on('data', function (d) {
        data += d
      })
      .on('end', function () {
        t.equal(data, 'module.exports = function () {} \nif (module && module.exports) { module.exports.__filename__ = "' + out + '" }\n ', '__filename__ exported')
        t.end()
      })
})

test('escapes quotes on windows', function (t) {
  var data = ''
  rs().pipe(transform('scripts\\foo.js', {}))
      .on('data', function (d) {
        data += d
      })
      .on('end', function () {
        t.equal(data, 'module.exports = function () {} \nif (module && module.exports) { module.exports.__filename__ = "scripts/foo.js" }\n ', '__filename__ exported')
        t.end()
      })
})
