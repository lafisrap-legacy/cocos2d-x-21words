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
	"B":4,
	"C":4,
	"D":4,
	"E":1,
	"F":4,
	"G":2,
	"H":2,
	"I":1,
	"J":8,
	"K":4,
	"L":2,
	"M":4,
	"N":1,
	"O":3,
	"P":5,
	"Q":16,
	"R":1,
	"S":1,
	"T":1,
	"U":3,
	"V":7,
	"W":6,
	"X":10,
	"Y":7,
	"Z":5,
	"Ä":6,
	"Ö":8,
	"Ü":6	
};

var letterCounts = {};
for( i=0,l="ABCDEFGHIJKLMNOPQURSTUVWXYZÄÖÜ" ; i<l.length ; i++ ) letterCounts[l[i]] = 0;

//Read the file and print its contents.
var filename = process.argv[2];
var hvReg = /^(\d+)-(\d+)$/,
	hvCnt = 0,
	hv = argv["h"] || null,
	lgCnt = 0;
	lg = argv["l"] || null,
	wv = argv["w"] || null;
	
if( wv ) {
	wv = wv.toUpperCase();
	for( var i=0, value =0 ; i<wv.length ; i++ ) {
		value += letterValues[wv[i]];
	} 
	
	console.log("Word value of "+wv+" is "+value+".");
	return;
}

var match = hvReg.exec(hv);

if( match ) {
	hvLow = parseInt(match[1]);
	hvHigh = parseInt(match[2]);
} else {
	hvLow = hvHigh = parseInt(hv);
}

var match = hvReg.exec(lg);

if( match ) {
	lgLow = parseInt(match[1]);
	lgHigh = parseInt(match[2]);
} else {
	lgLow = lgHigh = parseInt(lg);
}

	
fs.readFile(filename, 'utf8', function(err, data) {
	if (err) throw err;
	// get words into an array and sort them
	var allWords = data.split("\n").sort(),
		wordCnt = 0;
	
	// main loop: Iterating all words
	var muprisWords = {};
	var max = 0; min = 1000, wordCount = 0, prefixCount = 0;
	var entry = /^([^èéêóâôíç\s]+)\s(\S+)$/;
	console.log("Processing "+allWords.length+" words ...");
	for( var i=0 ; i<allWords.length ; i++ ) {
		// make all uppercase
		var match = entry.exec(allWords[i]);
		if( !match ) continue;

		var word = match[1].toUpperCase();
		var freq = match[2];

		if( word.length < 4 || word.length > 10) continue;
		
		// get three letter prefixes
		var prefix = word.substring(0,3);

		// compute word value
		var wordValue = 0;
		for( var j=0 ; j<word.length ; j++ ) {
			wordValue += letterValues[word[j]];
			if( !letterCounts[word[j]] ) letterCounts[word[j]] = 1;
			else letterCounts[word[j]]++;
		}
		max = Math.max(max,wordValue);
		min = Math.min(min,wordValue);
		
		// fullfill options
		if(hv && wordValue>=hvLow && wordValue<=hvHigh) {
			console.log("High value word: "+word+", with "+wordValue+" points.");
			hvCnt++;
		}
		if(lg && word.length>=lgLow && word.length<=lgHigh) {
			console.log("Found '"+word+"', with length "+word.length+".");
			lgCnt++;
		}
		if( isNaN(wordValue) ) console.log("Undefined letter in word: "+word); 

		// prepare word entry
		var wordEntry = {
			word: word,
			value: wordValue,
			frequency: freq
		}
		
		// if prefix is new, create a new word entry
		if( !muprisWords[prefix] ) {
			muprisWords[prefix] = [wordEntry];
			prefixCount++;
			wordCount++;
		// otherwise push it to the existing one
		} else {
			for( var j=0 ; j<muprisWords[prefix].length ; j++ ) if( muprisWords[prefix][j].word === word ) break;
			if( j === muprisWords[prefix].length ) {
				muprisWords[prefix].push(wordEntry);
				wordCount++;
			}
		}
	}
	
	if( hv ) console.log(hvCnt + " words between "+hvLow+" and "+hvHigh+" value.");
	if( lg ) console.log(lgCnt + " words between "+lgLow+" and "+lgHigh+" length.");

	fs.writeFile(filename+'.words.json', JSON.stringify(muprisWords), function (err) {
		  if (err) throw err;
		  console.log("File saved. "+wordCount+" words, "+prefixCount+" word groups. Max value: "+max+", min value: "+min+".");
		  
		  if(argv["c"]) {
			  var l;
			  for( l in letterCounts ) console.log(l+": "+letterCounts[l]);
			  
			  fs.writeFile(filename+'.letters.json', JSON.stringify(letterCounts), function (err) {
				  if (err) throw err;
				  
			  });
		  }
	});
});

