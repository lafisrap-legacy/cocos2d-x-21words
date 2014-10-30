/*
 * Mupris command line tools
 * 
 */


/*
 * COMMAND: words wordlist [outputfile]   // the command word will not not be interpreted yet ... 
 * PARAMETER: 
 * 		wordlist: File with list of words	 (Newline separated)
 * 		outputfile: json file directly usable by Mupris
 * 
 */


var util = require('util');
var argv = require('optimist').argv;
var fs = require('fs');
var XRegExp = require('xregexp').XRegExp;

//Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' 42WORDS-FILE INPUT-FILE');
  process.exit(1);
}

var prefixValues = [];

//Read the file and print its contents.
var filename1 = process.argv[2];
var filename2 = process.argv[3];
var filename3 = process.argv[4];

if( filename1 == "--help" ) {
	console.log("Usage: node addwords mainfile newwords [removewords]");
	return;
}


// read current main file 
fs.readFile(filename1, 'utf8', function(err, data) {
	if (err) throw err;
	
	var words = JSON.parse(data);

	fs.readFile(filename3, 'utf8', function(err, data) {
		if (err) removeWords = [];
		else 	 removeWords = data.match(/[\w\xc0-\xd6\xd8-\xf6\xf8-\xff]+/g).sort();
	
		fs.readFile(filename2, 'utf8', function(err, data) {
			if (err) throw err;
	
			var newWords = data.match(/[\w\xc0-\xd6\xd8-\xf6\xf8-\xff]+/g);
				foundWords = [];
			
			for( var i=0; i<newWords.length ; i++ ) {
				var nw = newWords[i].toUpperCase();
				if( nw.length < 4 || nw.length > 10 || removeWords.indexOf(nw) != -1 ) continue;
				
				var prefWords = words[nw.substr(0,3)];
				
				for( var j=0 ; prefWords && j<prefWords.length ; j++ ) if( nw == prefWords[j].word ) break;
				
				if( !prefWords || j==prefWords.length ) {
					//console.log("Found word: "+nw);
					foundWords.push(nw);
				}
			}
			
			foundWords.sort();
			
			for( var i=0 ; i<foundWords.length ; i++ ) {
				if( i && foundWords[i] != foundWords[i-1] && foundWords[i].length >= 4 ) console.log(foundWords[i]+" 21");
			}
		});
	});
});


