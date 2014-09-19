var jsdom = require("jsdom").jsdom;
var fs = require('fs');
fs.readFile('page.html', {encoding: "utf8"}, function (err, markup) {
  if (err) throw err;
  var doc = jsdom(markup);
  var window = doc.parentWindow;
  var $ = require('jquery')(window)
  var outerLeft = $(".left").clone().wrap('<div></div>').parent().html();
  var innerLeft = $(".left").html();
  console.log(outerLeft, "and ...", innerLeft);
});