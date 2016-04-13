// dependencies
var express = require('express');
var serveStatic = require('serve-static');
var https = require('https')

// constants
const PORT = 8081
const PUBLIC_DIR = __dirname + '/../public';

var app = express();

app.use(serveStatic(PUBLIC_DIR));

app.listen(PORT, function() {
  console.log('Express up @', PORT);  
});
