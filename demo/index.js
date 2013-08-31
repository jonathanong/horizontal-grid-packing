var fs = require('fs')
var path = require('path')
var request = require('request')
var jade = require('jade')

var string = fs.readFileSync(path.join(__dirname, 'index.jade'), 'utf8')
var template = jade.compile(string)

request('http://imgur.com/r/taylorswift.json', function (err, res, body) {
  if (err)
    throw err

  fs.writeFileSync(
    path.join(__dirname, '..', 'demo.html'),
    template({
      images: JSON.parse(body).data
    })
  )

  process.exit()
})