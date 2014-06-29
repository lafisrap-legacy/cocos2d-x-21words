/*
 * Enhancement module for Mupris
 * 
 * NEXT STEPS:
 * 
 * - show a selection, 
 * - move selections together with rows, delete them if row is deleted
 * - select a selection
 * - 
 */

var	LETTER_NAMES = ["a.png","b.png","c.png","d.png","e.png","f.png","g.png","h.png","i.png","j.png","k.png","l.png","m.png","n.png","o.png","p.png","q.png","r.png","s.png","t.png","u.png","v.png","w.png","x.png","y.png","z.png","ae.png","oe.png","ue.png"],
	LETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ä","Ö","Ü"],
	LETTER_VALUES = {"A":1,"B":3,"C":4,"D":1,"E":1,"F":4,"G":2,"H":2,"I":1,"J":6,"K":4,"L":2,"M":3,"N":1,"O":2,"P":4,"Q":10,"R":1,"S":1,"T":1,"U":1,"V":6,"W":3,"X":8,"Y":10,"Z":3,"Ä":6,"Ö":8,"Ü":6},
	LETTER_OCCURANCES = [5,2,2,4,15,2,3,4,6,1,2,3,4,9,3,1,1,6,7,6,6,1,1,1,1,1,1,1,1],
	STAGE_COLORS = [{r:255,g:0,b:0},{r:0,g:255,b:0},{r:0,g:0,b:255},{r:255,g:0,b:255}],
	TINT_SPEED = 1.0,
	MARKER_SET = 1,
	MARKER_OPT = 2;

var MUPRIS_MODULE = function(muprisLayer) {

	var ml = muprisLayer;
	/*
	 * Initializations
	 * 
	 */
	
	// go through box array and look for prefixes
	var checkForPrefixes = function(brc, cb) {

		for( var i=Math.max(0,brc.col-2) ; i<=Math.min(BOXES_PER_ROW-2,brc.col) ; i++) {
			var prefix = (ml.boxes[brc.row][i]   && ml.boxes[brc.row][i].userData || " ")+
						 (ml.boxes[brc.row][i+1] && ml.boxes[brc.row][i+1].userData || " ")+
						 (ml.boxes[brc.row][i+2] && ml.boxes[brc.row][i+2].userData || " "),
				words = ml.words[prefix];

			if( !(ml.boxes[brc.row][i] && ml.boxes[brc.row][i].words) && words && cb ) {
				cc.log("checkForPrefixes: Found "+words.length+" words at "+brc.row+"/"+i);
				
				var w = [];
				for( var j=0 ; j<words.length ; j++ ) w[j] = words[j].word; 
				for( var j=words.length-1 ; j>=0 ; j-- ) {
					if( i + w[j].length > BOXES_PER_ROW ) {
						words.splice(j,1);
					}
				}
				
				if( words.length > 0 ) cb({row:brc.row,col:i}, words);
			}
		}
	};
	
	// update selected word
	var updateSelectedWord = function() {
		var sw = ml.selectedWord,
		batch = ml.getChildByTag(TAG_SPRITE_MANAGER);
		
		// Define sprites and show word start sprite
		var setMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker0.png"),
			optMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker1.png"),
			startMarker = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("marker2.png"),cc.rect(0,0,BS,BS));
		startMarker.retain();
		startMarker.setPosition(cc.p(BOXES_X_OFFSET + sw.brc.col * 64 - 18,BOXES_Y_OFFSET + sw.brc.row * 64 + 32));
		batch.addChild(startMarker,5	);
				
		// Mark letters
		// First look for all words that are still possible
		var curWords = sw.words.slice();
		for( var i=sw.brc.col ; i<BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			if( sw.markers[col] === MARKER_SET ) {
				var letter = ml.boxes[sw.brc.row][i].userData;
				// take out all words that don't match the letters where markers are set
				for( var j=curWords.length-1 ; j>=0 ; j-- ) {
					if( sw.words[j][col] != letter ) curWords.splice(j,1);
				}
			}
		}
		for( var i=sw.brc.col ; i<BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			if( sw.markers[col] === MARKER_SET ) {
				// nothing to do
				for( var j=0 ; j<curWords.length ; j++ ) {
					cc.assert(ml.boxes[sw.brc.row][i] && curWords[j].word[col] === ml.boxes[sw.brc.row][i].userData, "Mupris, updateSelectedWord: Marker set on a letter that is not correct." );
				}
			} else {
				// remove old sprite
				if( sw.sprites[col] ) batch.removeChild( sw.sprites[col] );
				sw.sprites[col] = null;
				for( var j=0,hits=0 ; j<curWords.length ; j++ ) {
					if(ml.boxes[sw.brc.row][i] && curWords[j].word[col] === ml.boxes[sw.brc.row][i].userData ) hits++;
				}
				if( hits === 0 ) {
					// letter in box matches with no word
					sw.markers[col] = null;
				} else if( hits === curWords.length ) {
					// letter in box matches with all words, draw sprite
					sw.markers[col] = MARKER_SET;
					sw.sprites[col] = cc.Sprite.create(setMarkerFrame,cc.rect(0,0,BS,BS));
				} else {
					// letter in box matches with all words, draw sprite
					sw.markers[col] = MARKER_OPT;
					sw.sprites[col] = cc.Sprite.create(optMarkerFrame,cc.rect(0,0,BS,BS));					
				}
				
				if( hits > 0 ) {
					cc.assert(sw.sprites[col], "Mupris, updateSelectedWord: sprite is null.");
					
					sw.sprites[col].retain();
					sw.sprites[col].setPosition(cc.p(BOXES_X_OFFSET + i * BS + BS/2, BOXES_Y_OFFSET + sw.brc.row * BS - 20));
					batch.addChild(sw.sprites[col],5);
				}	
			}
		}
		
		// look if all marked letters form a complete word, then make them green
	};
	
	/*
	 * hookLoadImages
	 * 
	 * Called before default images for tiles are loaded
	 * 
	 */
	muprisLayer.hookLoadImages = function() {
		cc.spriteFrameCache.addSpriteFrames(res.letters_plist);
	    var lettersTexture = cc.textureCache.addImage(res.letters_png),
	    	lettersImages  = cc.SpriteBatchNode.create(lettersTexture,200);
	    muprisLayer.addChild(lettersImages, 0, TAG_SPRITE_MANAGER);
	};

	/*
	 * hookSetTileImages
	 * 
	 * Called while building a tile to set the images of the tile boxes
	 * 
	 * Param: tileBoxes: metrics of the boxes 
	 * 
	 */
	muprisLayer.hookSetTileImages = function(tileBoxes, newTile, p, userData) {

		var tileSprite = cc.Sprite.create(res.letters_png,cc.rect(0,0,0,0)),
			batch = this.getChildByTag(TAG_SPRITE_MANAGER);
				
		tileSprite.retain();
		tileSprite.setPosition(p);
		batch.addChild(tileSprite);

        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var val = Math.floor(this.getRandomValue(LETTER_OCCURANCES)),
    			spriteFrame = cc.spriteFrameCache.getSpriteFrame(LETTER_NAMES[val]),
    			sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,BS,BS));
    	
    		sprite.retain();
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
        	userData[i] = LETTERS[val];
	        tileSprite.addChild(sprite);
        }
        
        return tileSprite;
	};	
	
	muprisLayer.hookTileFixed = function( brcs ) {
		
		for( var i=0 ; i<brcs.length ; i++ ) {
			var brc = brcs[i],
				box = muprisLayer.boxes[brc.row][brc.col];
			
			cc.assert(box , "Mupris, hookTileFixed: box should not be null.")
				
			box.color = box.sprite.getColor();
			box.interval = setInterval(function(box) {	
				var op = box.sprite.getOpacity();
				op-=3;
				if( op >= 128 ) box.sprite.setOpacity(op);
				else {
					clearInterval(box.interval);
					box.interval = null;
				}
			},20,box);
			checkForPrefixes(brc, function(brc, words) {
				var row = muprisLayer.boxes[brc.row];
				for( var i=0 ; i<3 ; i++ ) {
					var box = muprisLayer.boxes[brc.row][brc.col+i];
					setTimeout(function(box) {
						if( box.sprite ) box.sprite.setOpacity(255);
						if( box.interval ) {
							clearInterval(box.interval);
							box.interval = null;
						}
					}, TINT_SPEED*1000,box);
				}
				if( !box.words ) {
					box.words = words;
					muprisLayer.selections.push({
						brc: brc,
						width: BS * 3,
						height: BS,
						pos: {
							x: BOXES_X_OFFSET + brc.col * BS,
							y: BOXES_Y_OFFSET + brc.row * BS,
						}
					});
					
					for( var i=0 ; i<words.length ; i++ ) cc.log("Retrieved word "+words[i].word+" at position "+brc.row+"/"+brc.col);
				}
				
				if( !ml.selectedWord ) {
					ml.selectedWord = {
						brc: brc,
						words: words,
						markers: [],
						sprites: []
					}
					updateSelectedWord();
				}
			});
		}					
	};	
	
	muprisLayer.hookDeleteBox = function(brc) {
		var sw = ml.selectedWord,
			box = ml.boxes[brc.row][brc.col];
		
		if( sw && sw.brc.row === brc.row && sw.markers[brc.col-sw.brc.col] === MARKER_SET ) return false;

		if( box.interval ) {
			clearInterval(box.interval);
			box.interval = null;
		}
		// look if there is a selection starting at this position ...
		if( box.words ) {
			var s = ml.selections;
			for( var i=s.length-1 ; i>=0 ; i--) {
				if( s[i].brc.col === brc.col && s[i].brc.row === brc.row ) s.splice(i,1);
			}
		}
		return true;
	};
	
	
	// read json file with words
	cc.loader.loadJson("res/words/dewords.words.json", function(err, text) {
		if( !err ) {
			muprisLayer.words = text;
		}
	});
};