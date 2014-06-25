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

//Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' INPUTFILE [OUTPUTFILE]');
  process.exit(1);
}

// Define data we need

var letterValues = {
		"A":1,
		"B":3,
		"C":4,
		"D":1,
		"E":1,
		"F":4,
		"G":2,
		"H":2,
		"I":1,
		"J":6,
		"K":4,
		"L":2,
		"M":3,
		"N":1,
		"O":2,
		"P":4,
		"Q":10,
		"R":1,
		"S":1,
		"T":1,
		"U":1,
		"V":6,
		"W":3,
		"X":8,
		"Y":10,
		"Z":3,
		"Ä":6,
		"Ö":8,
		"Ü":6	
};

var letterCounts = {};

//Read the file and print its contents.
var filename = process.argv[2];
var sLetter = argv["l"] && argv["l"].toUpperCase() || null;
var highValues = argv["h"] || null;
fs.readFile(filename, 'utf8', function(err, data) {
	if (err) throw err;
	// get words into an array and sort them
	var words = data.split("\n").sort();
	
	// main loop: Iterating all words
	var muprisWords = {};
	var max = 0; min = 1000, count = 0;
	console.log("Processing "+words.length+" words ...");
	for( var i=0 ; i<words.length ; i++ ) {
		// make all uppercase
		words[i] = words[i].toUpperCase();

		// get three letter prefixes
		var prefix = words[i].substring(0,3);

		// compute word value
		var wordValue = 0;
		for( var j=0 ; j<words[i].length ; j++ ) {
			wordValue += letterValues[words[i][j]];
			if( !letterCounts[words[i][j]] ) letterCounts[words[i][j]] = 1;
			else letterCounts[words[i][j]]++;
		}
		max = Math.max(max,wordValue);
		min = Math.min(min,wordValue);
		
		// fullfill options
		if(highValues && wordValue>=highValues) console.log("High value word: "+words[i]+", with "+wordValue+" points.");
		if(sLetter && words[i].indexOf(sLetter) != -1) console.log("Word with "+sLetter+": "+words[i]+". Word value: "+wordValue+" points.");
		if( isNaN(wordValue) ) console.log("Undefined letter in word: "+words[i]); 

		// prepare word entry
		var wordEntry = {
				word: words[i],
				value: wordValue,
		}
		
		// if prefix is new, create a new word entry
		if(prefix !== lastPrefix) {
			muprisWords[prefix] = [wordEntry];
			count++;
		// otherwise push it to the existing one
		} else {
			muprisWords[prefix].push(wordEntry);
		}
		var lastPrefix = prefix;
	}

	fs.writeFile(filename+'.words.json', JSON.stringify(muprisWords), function (err) {
		  if (err) throw err;
		  console.log("File saved. "+count+" word groups. Max value: "+max+", min value: "+min+".");
		  
		  if(argv["c"]) {
			  var l;
			  for( l in letterCounts ) console.log(l+": "+letterCounts[l]);
			  
			  fs.writeFile(filename+'.letters.json', JSON.stringify(letterCounts), function (err) {
				  if (err) throw err;
				  
			  });
		  }
	});
});

