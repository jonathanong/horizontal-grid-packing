var request = require('request')
var http = require('http')
var express = require('express')

var app = express()

var images

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.use(express.static(__dirname + '/build'))
app.use(express.static(__dirname + '/public'))

app.get('*', function (req, res, next) {
  res.render('layout')
})

request('http://imgur.com/r/emmawatson.json', function (err, res, body) {
  if (err)
    throw err

  app.locals.images = JSON.parse(body).data

  var port = process.env.PORT || 3012

  http.createServer(app).listen(port, function (err) {
    if (err)
      throw err

    console.log('hor-pack serving on port ' + port)
  })
})