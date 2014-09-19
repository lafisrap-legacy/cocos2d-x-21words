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

var letterValues = {};

// max 32 letters each!

letterValues.german = {
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
	"Ü":6,
	"1":7,
	"3":8
};

letterValues.english = {
		"A":1,
		"B":5,
		"C":3,
		"D":5,
		"E":1,
		"F":7,
		"G":5,
		"H":6,
		"I":1,
		"J":7,
		"K":6,
		"L":2,
		"M":4,
		"N":1,
		"O":1,
		"P":5,
		"Q":8,
		"R":1,
		"S":2,
		"T":1,
		"U":4,
		"V":6,
		"W":6,
		"X":7,
		"Y":5,
		"Z":7,
		"1":7,
		"3":8
	};

letterValues.estonian = {
		"A":1,
		"B":8,
		"D":4,
		"E":1,
		"F":10,
		"G":4,
		"H":3,
		"I":1,
		"J":7,
		"K":1,
		"L":1,
		"M":2,
		"N":2,
		"O":3,
		"P":4,
		"R":2,
		"S":1,
		"T":1,
		"U":1,
		"V":4,
		"Ä":5,
		"Ö":8,
		"Ü":6,
		"Õ":6,
		"1":5,
		"3":8
	};

letterValues.swedish = {
		"A":1,
		"B":4,
		"C":8,
		"D":1,
		"E":1,
		"F":4,
		"G":2,
		"H":6,
		"I":1,
		"J":8,
		"K":2,
		"L":1,
		"M":3,
		"N":1,
		"O":2,
		"P":4,
		"Q":12,
		"R":1,
		"S":1,
		"T":1,
		"U":4,
		"V":5,
		"W":12,
		"X":10,
		"Y":7,
		"Z":12,
		"Ä":4,
		"Ö":5,
		"Å":7,
		"1":7,
		"3":8
	};

var letterCounts = {};
for( i=0,l="ABCDEFGHIJKLMNOPQURSTUVWXYZÄÖÜÕ" ; i<l.length ; i++ ) letterCounts[l[i]] = 0;

var prefixValues = [];

//Read the file and print its contents.
var filename = process.argv[2];
var hvReg = /^(\d+)-(\d+)$/,
	hvCnt = 0,
	hv = argv["h"] || null,
	lgCnt = 0;
	lg = argv["l"] || null,
	wv = argv["w"] || null,
	src = argv["s"] || "german",
	verbose = argv["v"] || null,
	test = argv["t"] || null;

if( filename == "--help" ) {
	console.log("Usage: node makejson filename [-options]");
	console.log("Options:");
	console.log("-h n1-n2: List words with value between n1 and n2.");
	console.log("-l n1-n2: List words with length between n1 and n2.");
	console.log("-w word: Show word value of word.");
	console.log("-s source: Define source language.");
	console.log("-c: Display word frequencies and write letter values to file.");
	console.log("-v: verbose.");
	console.log("-t: test with the first 20 entries.");
	return;
}
if( wv ) {
	wv = wv.toUpperCase();
	for( var i=0, value =0 ; i<wv.length ; i++ ) {
		value += letterValues[src][wv[i]];
	} 
	
	console.log("Word value of "+wv+" is "+value+".");
	return;
}
if( src && !letterValues[src] ) {
	console.log("Language "+src+" unknown.");	
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

// calculate letter order
var letterOrder = [],
	lvs = letterValues[src];
for( var i in lvs ) letterOrder.push({letter:i,value:lvs[i]});
letterOrder.sort(function(a,b) { return a.value - b.value });
for( var i=0 ; i<letterOrder.length ; i++ ) {
	letterOrder[i] = letterOrder[i].letter;
	lvs[letterOrder[i]] = {
		value:lvs[letterOrder[i]],
		order:i
	}; 
}

// read file and interpret it ...
fs.readFile(filename, 'utf8', function(err, data) {
	if (err) throw err;
	// get words into an array and sort them
	var allWords = data.split("\n"),
		wordCnt = 0;
	
	// main loop: Iterating all words
	var muprisWords = {};
	var max = 0; min = 1000, wordCount = 0, prefixCount = 0;
	var entry = src=="german"? /^([^èéêóâôíç\s]+)\s(\S+)$/ :
				src=="estonian"? /^(\S+)\s+([^èéêóâôíç\s]+)\s*$/: 
				src=="english"? /^\d{8} \d\d \w \d\d ([^_èéêóâôíç\-'.\(\/\d\s]+)\s/ : 
				src=="swedish"? /^([^èéêóâôíç\s]+)$/ : null;
	
	console.log("Processing "+allWords.length+" words ...");
	for( var i=0 ; i<(test? 20 : allWords.length) ; i++ ) {
		// make all uppercase
		if( verbose ) console.log("\n\nLooking at word: "+allWords[i]);
		var match = entry.exec(allWords[i]);
		if( !match ) continue;	
		if( verbose ) console.log("Found word: "+match[0]);

		// get word and frequency
		switch(src) {
		case "eesti":
			var word = match[2].toUpperCase();
			var freq = match[1];			
			break;
		case "english":
			var word = match[1].toUpperCase();
			var freq = 0;						
			break;
		default:
			var word = match[1].toUpperCase();
			var freq = match[2];			
		}

		if( word.length < 4 || word.length > 10) continue;
		
		// get three letter prefixes
		var prefix = word.substring(0,3);

		// compute word value
		var wordValue = 0;
		for( var j=0 ; j<word.length ; j++ ) {
			wordValue += letterValues[src][word[j]].value;
			if( isNaN(wordValue) ) {
				console.log("Undefined letter in word: "+word+", letter: '"+word[j]+"'"); 
				break;
			}
			if( !letterCounts[word[j]] ) letterCounts[word[j]] = 1;
			else letterCounts[word[j]]++;
		}
		if( isNaN(wordValue) ) {
			continue;
		}
		
		if( !prefixValues[wordValue] ) prefixValues[wordValue] = [prefix];
		else if( prefixValues[wordValue].indexOf(prefix) === -1 ) {
			
			if( prefixValues[wordValue].length < 20 ) prefixValues[wordValue].push(prefix);
			else prefixValues[wordValue].splice(Math.floor(Math.random()*prefixValues[wordValue].length),0,prefix);
		}
		
		// set letter profile (a bit for each letter used) ... (3774191835 & 4294967295) >>> 0
		var letterProfile = 0;
		for( var j=0 ; j<word.length ; j++ )
			letterProfile |= 1 << letterOrder.indexOf(word[j]) >>> 0;
		
		max = Math.max(max,wordValue);
		min = Math.min(min,wordValue);
		
		// prepare word entry
		var wordEntry = {
			word: word,
			value: wordValue,
			profile: letterProfile
		}
		if( verbose ) console.log("Found word '"+wordEntry.word+"' with a value of "+wordEntry.value);
		
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
			} else {
				continue;
			}
		}
		
		// fullfill options
		if(hv && wordValue>=hvLow && wordValue<=hvHigh) {
			console.log("High value word: "+word+", with "+wordValue+" points.");
			hvCnt++;
		}
		if(lg && word.length>=lgLow && word.length<=lgHigh) {
			console.log("Found '"+word+"', with length "+word.length+".");
			lgCnt++;
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
			  
			  fs.writeFile(filename+'.letters.json', JSON.stringify(letterValues[src]), function (err) {
				  if (err) throw err;
				  
			  });
			  
			  for( var i in prefixValues ) prefixValues[i] = prefixValues[i].slice(0,20);
			  fs.writeFile(filename+'.prefixes.json', JSON.stringify(prefixValues), function (err) {
				  if (err) throw err;
				  
			  });
		  }
	});
});

