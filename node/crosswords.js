/*
 * External modules
 * 
 * jQuery: 		DOM handling
 * util:		
 * optimist: 	command line arguments
 * fs:			file system commands
 * 
 */
var $ = require('jquery')(require("jsdom").jsdom().parentWindow),
	util = require('util'),
	argv = require('optimist').argv,
	fs = require('fs');

// usage
var filename = process.argv[2];
if (process.argv.length < 3 || filename == "--help" ) {
	console.log("\nUsage: node crosswords filename [-options]\n");
	console.log("Options:");
	console.log("-s BOARD SIZE");
	console.log("-b MAX BORDS");
	console.log("-h SHOW HTML BOARDS");
	process.exit(1);
}


// global variables and constants
var BOARD_SIZE = argv["s"] || 20,
	MAX_BOARDS = argv["b"] || 10000,
	HTML_BOARDS = argv["h"] || 20;

// global functions
var newBoard = function() {
	var board = [];
	for( var i=0 ; i<BOARD_SIZE ; i++ ) board.push([]);
	return board;
};

fs.readFile(filename, 'utf8', function(err, data) {
	if (err) throw err;

	var allWords = data.split("\n");
		boards = [];
	
	// create boards and place first word
	var word = allWords[0].toUpperCase();
	for( var i=0 ; i<BOARD_SIZE ; i++ ) {
		for( var j=0 ; j<BOARD_SIZE ; j++ ) {

			// place horizontally
			if( j < BOARD_SIZE-word.length ) {
				var board = newBoard();
				boards.push(board);
				for( var k=0 ; k<word.length ; k++ ) board[i][j+k] = word[k];
			}
			
			// place vertically
			if( i < BOARD_SIZE-word.length ) {
				var board = newBoard();
				boards.push(board);
				for( var k=0 ; k<word.length ; k++ ) board[i+k][j] = word[k];
			}
		}
	}
	
	// fill boards with words
	for( var i=1 ; i<allWords.length ; i++ ) {
		var oldBoards = boards,
			word = allWords[i].toUpperCase();

		boards = [];
		
		console.log("Processing word "+(i+1)+": "+word+"...");

		boards:
		for( var j=0 ; j<oldBoards.length ; j++ ) {
			//console.log("---Checking board "+j+" of "+oldBoards.length);
			
			var oldBoard = oldBoards[j];
			for( var r=0 ; r<BOARD_SIZE ; r++ ) {
				for( var c=0 ; c<BOARD_SIZE ; c++ ) {
					
					// try to lay word horizontally
					if( c <= BOARD_SIZE-word.length ) {
						
						var intersects = 0;
						for( var k=0 ; k<word.length ; k++ ) {
							if( oldBoard[r][c+k] === word[k] ) intersects++;
							else if( oldBoard[r][c+k] !== undefined ) break;
							else if( r > 0 && oldBoard[r-1][c+k] !== undefined ||
									 r < BOARD_SIZE-1 && oldBoard[r+1][c+k] !== undefined ) break;
						}

						// special cases
						if( c > 0 && oldBoard[r][c-1] !== undefined || 
							c+word.length < BOARD_SIZE && oldBoard[r][c+word.length] !== undefined ) continue;
												
						// if an intersection was found and full word fit onto board ...
						if( intersects > 0 && k === word.length ) {
							//console.log("------Creating new board at position "+r+"/"+c+" with horizontal word "+word+".");

							// create a new board and fill it with word
							for (var k=0, board=[] ; k<oldBoard.length; k++) board[k] = oldBoard[k].slice();
							for( var k=0 ; k<word.length ; k++ ) board[r][c+k] = word[k];
							boards.push(board);
							if( boards.length >= MAX_BOARDS ) break boards;
						}
					}
					
					// try to lay word vertically
					if( r <= BOARD_SIZE-word.length ) {
						var intersects = 0;
						for( var k=0 ; k<word.length ; k++ ) {
							if( oldBoard[r+k][c] === word[k] ) intersects++;
							else if( oldBoard[r+k][c] !== undefined ) break;
							else if( c > 0 && oldBoard[r+k][c-1] !== undefined ||
									 c < BOARD_SIZE-1 && oldBoard[r+k][c+1] !== undefined ) break;
						}

						// special cases
						if( r > 0 && oldBoard[r-1][c] !== undefined || 
							r+word.length < BOARD_SIZE && oldBoard[r+word.length][c] !== undefined ) continue;
						
						// if an intersection was found and full word fit onto board ...
						if( intersects > 0 && k === word.length ) {
							//console.log("------Creating new board at position "+r+"/"+c+" with vertical word "+word+".");

							// create a new board and fill it with word
							for (var k=0, board=[] ; k<oldBoard.length; k++) board[k] = oldBoard[k].slice();
							for( var k=0 ; k<word.length ; k++ ) board[r+k][c] = word[k];
							boards.push(board);
							if( boards.length >= MAX_BOARDS ) break boards;
						}
					}
				}
			}
		}
		
		console.log("... "+boards.length+" boards found.");
	}

	$("head").append("<meta charset='utf-8'>")
			 .append("<link rel='stylesheet' href='"+filename+".css' />");
	for( var i=0 ; i< Math.min( HTML_BOARDS , boards.length ) ; i++ ) {
		var table = $("body").append("<h2>Crossword "+i+"</h2><table id='table"+i+"'></table>").find("#table"+i),
			board = boards[i];
		$("body").append("<div class='json'>"+JSON.stringify(board)+"</div>");
		for( var r=0 ; r<BOARD_SIZE ; r++) {
			var row = table.append("<tr class='row"+r+"'></tr>").find(".row"+r);
			for( var c=0 ; c<BOARD_SIZE ; c++ ) {
				var val = board[r][c] || "";
				row.append("<td class='cell"+(val!==""?" cell_"+val:"")+"'></td>");
			}
		}
	}
	
	fs.writeFile(filename+'.html', $("html").html(), function (err) {
		  if (err) throw err;
	});	
});

