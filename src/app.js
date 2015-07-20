////////////////////////////////////////////////////////////////////
// Main app holding a plain vanilla tetris game
//
//  LAYERS
//
// _42_GLOBALS:     Globally available variables
// _42GameLayer:    The TETRIS like game
// _42MenuLayer:    The menu functionality
// _42TitleLayer:   The title screen
//  
//  HOOKS to overload functionality (all in _42GameLayer)
//
//  hookStartGame
//  hookLoadImages
//  hookOnLongTap
//  hookOnTap 
//  hookSetTile
//  hookSetTileImages 
//  hookTileFixed 
//  hookTileFixedAfterRowsDeleted 
//  hookMoveBoxDown 
//  hookAllBoxesMovedDown 
//  hookDeleteBox 
//  hookUpdate
//  hookEndGame
//
//
//  Todo:
//
//  - make wordFrame sprite bleong to app.js
//
//  
//
////////////////////////////
// Global variables
//
var _42_GLOBALS = { 
    TITLE_MENU_COLOR: cc.color(0,40,0,255), // 
	TAG_SPRITE_MANAGER : 1,                 // Sprite Ids
	TAG_GAME_LAYER : 3,                     //
	TAG_TITLE_LAYER : 4,                    //
	TAG_NONE : 100,                         // 
	TAG_BACKGROUND_SPRITE : 101,            //
	TAG_MENU_QUESTION : 102,                //
	TAG_MENU_MENU : 103,                    //
	TAG_TITLE_BACKGROUND : 104,             //
	TAG_TITLE_4 : 105,                      //
	TAG_TITLE_2 : 106,                      //
	TAG_TITLE_WORD : 107,                   //
	TAG_LEAF_1 : 108,                       //
	TAG_LEAF_2 : 110,                       //
	TAG_LEAF_3 : 111,                       //
	TAG_LEAF_4 : 112,                       //
	TAG_LEAF_5 : 113,                       //  
	TAG_LEAF_6 : 114,                       //
	TAG_START_BUTTON : 115,                 //
	BS : 64, 			                    // box size in pixel
	BOXES_PER_COL : 22,	                    // lines of playground 
	GAME_OVER_ROW : 15,	                    // game over row
	BOXES_PER_ROW : 10,	                    // cols in playgound
	BOXES_X_OFFSET : 0,                     // position of the playground: x
	BOXES_Y_OFFSET : 96,                    // y
	INITIAL_TILE_ROTATION: 0,               // How the tiles start coming
	SNAP_SPEED : 10.0,                      // pixel per 1/60    
	LONG_TAP_TIME : 300,                    // minimum time for tap
	FALLING_SPEED : 0.40,                   // pixel per 1/60
	MOVE_SPEED : 0.09,                      // animation speed of sprites in seconds
	TOUCH_THRESHOLD : 6,                    // pixel
	KEY_LEFT_CODE : 37,                     // keys for browser usage
	KEY_UP_CODE : 38,                       //
	KEY_RIGHT_CODE : 39,                    //
	KEY_DOWN_CODE : 40,                     //
    SCOREBAR_SETBACK : 3,                   // time after score shows level 0 again
    SCOREBAR_MAX_LAYER_SCROLL: 2,           // Maximum levels of score bar
	TILE_BOXES : [                          // Tetris forms
	    [{x:-1.5*64,y: 0.0*64},{x:-0.5*64,y: 0.0*64},{x: 0.5*64,y: 0.0*64},{x: 1.5*64,y: 0.0*64}],
		[{x:-0.5*64,y:-0.5*64},{x:-0.5*64,y: 0.5*64},{x: 0.5*64,y:-0.5*64},{x: 0.5*64,y: 0.5*64}],
		[{x:-1.0*64,y:-0.5*64},{x:-1.0*64,y: 0.5*64},{x: 0.0*64,y:-0.5*64},{x: 1.0*64,y:-0.5*64}],
		[{x:-1.0*64,y:-0.5*64},{x: 1.0*64,y: 0.5*64},{x: 0.0*64,y:-0.5*64},{x: 1.0*64,y:-0.5*64}],
		[{x:-1.0*64,y: 0.5*64},{x: 0.0*64,y: 0.5*64},{x: 0.0*64,y:-0.5*64},{x: 1.0*64,y:-0.5*64}],
		[{x:-1.0*64,y:-0.5*64},{x: 0.0*64,y:-0.5*64},{x: 0.0*64,y: 0.5*64},{x: 1.0*64,y: 0.5*64}],
		[{x:-1.0*64,y:-0.5*64},{x: 0.0*64,y:-0.5*64},{x: 1.0*64,y:-0.5*64},{x: 0.0*64,y: 0.5*64}],
	],
	TILE_OCCURANCES : [10,5,7,7,2,2,7,0,0], // How often the tiles appear, when selected randomly
};
var $42 = _42_GLOBALS;

/////////////////////////////////////////////////////////////////////////////////7
// The game layer
//
var _42GameLayer = cc.Layer.extend({
    sprite:null,
    
    tiles: [],
	boxes: [],
	selections: [],
	
    touchStartPoint: null,
    touchStartTime: null,
    touchCurrentPoint: null,
    touchLastPoint: null,
    touchStartTime: null,
    touchDistance: null,
    isSwipeUp: false,
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeDown: false,    
    isTap: false,
   
    //////////////////////////////////////////////////////////////////////////
    // ctor is the startup function of the game layer
    ctor:function () {
        this._super();

        var size = this.size = cc.director.getWinSize(),
        	res = cc.director.getOpenGLView().getFrameSize();
        
        $42.TOUCH_SWIPE_THRESHOLD = $42.TOUCH_THRESHOLD * size.height / res.height;
        cc.log();
        
        /////////////////////////
        // Look if there is a plugin module
        if( typeof _42_MODULE === 'function' ) _42_MODULE(this);

        this.showLogOnScreen();
        this.initBoxSpace();
        this.loadImages();

	    this.tiles = [];
	    
        return true;
    },

    ////////////////////////////////////////////////////////////////////////////
    // onEnter is also called at creation of the object, but after ctor
    onEnter: function() {
    	var self = this;
		this._super();

		this.initListeners();
		
		if( self.hookStartGame ) self.hookStartGame();
        
        this.initScorebar();

		setTimeout(function() {
		    self.scheduleUpdate();
		},2500);
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // onExit is called when the object is destructed
    onExit: function() {
		this._super();

	    this.stopListeners();
	    this.unscheduleUpdate();	    	
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // endGame cleans up after a game is finished
    endGame: function() {
        ///////////////////
    	// delete all boxes
		for( var i=0 ; i<$42.BOXES_PER_COL ; i++ ) this.deleteRow(i,true);

        ///////////////////
        // delete scoreBar
        _42_release( $42._scoreBar );
		_42_release( $42._rollingLayer );

		$42._scoreBar.removeAllChildren(true);
        this.removeChild($42._scoreBar);
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // 
	showLogOnScreen: function() {
		
        var size = this.size;

        // tmp Errormessage layer
        var logMsg = cc.Node.create();
        
        $42.msg1 = cc.LabelTTF.create("TEST1", "Arial", 24),
        $42.msg2 = cc.LabelTTF.create(" ", "Arial", 24);
        
        $42.msg1.setPosition(0,0);
        $42.msg2.setPosition(0,-20);
		logMsg.setPosition(size.width/2,size.height-50);

		logMsg.addChild($42.msg1, 1);        	
		logMsg.addChild($42.msg2, 1);        	
        this.addChild(logMsg, 100);
        
	},
	
    ////////////////////////////////////////////////////////////////////////////
    // loadImages loads tile images itself or calls a hook to do it
	loadImages: function() {

		// lets module load images ...
		if( this.hookLoadImages ) this.hookLoadImages();
		else {
			// ... or load default
	        cc.spriteFrameCache.addSpriteFrames(res.tiles_plist);
		}
	},
	
    ////////////////////////////////////////////////////////////////////////////
    // initBoxSpace initializes the box array and draws the score bar
	initBoxSpace: function() {
        var size = this.size;
        
	    // initialize boxes arrays
	    for( var i=0 ; i<$42.BOXES_PER_COL ; i++ ) {
		    for( var j=0 ; j<$42.BOXES_PER_ROW ; j++ ) {
		    	if( !this.boxes[i] ) this.boxes[i] = []; 
		    	this.boxes[i][j] = null;		    	
		    }		    	
	    }
	},
    
    /////////////////////////////////////////////////////////////////////////////
    // initScorebar initializes the score bar below the play field
    initScorebar: function() {

        ///////////////////////////////
	    // draw score bar background
	    this.drawNode = cc.DrawNode.create();
        this.addChild(this.drawNode,1);
        this.drawNode.clear();
        this.drawNode.drawPoly([cc.p(0,0),cc.p(cc.width,0),cc.p(cc.width,$42.BOXES_Y_OFFSET ),cc.p(0,$42.BOXES_Y_OFFSET )],
        						new cc.Color(0,0,0,255), 
        						1, 
        						new cc.Color(0,0,0,255));

        ////////////////////////////////
        // create score bar
        var sb = $42._scoreBar = new cc.LayerColor(cc.color(128,0,0,0),cc.width,$42.BOXES_Y_OFFSET);

        sb.setPosition(0,0);
        sb.setOpacity(0);
        _42_retain(sb, "scorebar");	
        this.addChild(sb, 5);

        //////////////////////////////////////        
        // create clipping clipping rect with stencil
        var clipper = cc.ClippingNode.create();
        clipper.width = 640;
        clipper.height = $42.BOXES_Y_OFFSET;
        clipper.anchorX = 0.5;
        clipper.anchorY = 0.5;
        clipper.x = 320;
        clipper.y = $42.BOXES_Y_OFFSET / 2;
        // stencil
        var stencil = cc.DrawNode.create(),
            rectangle = [
                cc.p(0, 0),
                cc.p(clipper.width, 0),
                cc.p(clipper.width, clipper.height),
                cc.p(0, clipper.height)
            ],
            white = cc.color(255, 255, 0, 0);
        
        stencil.drawPoly(rectangle, white, 1, white);
        clipper.stencil = stencil;
        sb.addChild(clipper);

        ////////////////////////////
        // create rolling layer
        rl = $42._rollingLayer = new cc.Layer();
        rl.setPosition(0,0);
        _42_retain(rl, "rolling layer");	
        clipper.addChild(rl, 5);

        /////////////////////////////
        // call hook and eventually write initial score
        if( !this.hookInitScorebar || !this.hookInitScorebar() ) {
            this._scorebarScore = this.drawScorebarText("Hello World!",cc.p(cc.width/2,50),72,$42.SCORE_COLOR_BRIGHT);
        }
    },

    drawScorebar: function(highlight) {
        /////////////////////////////
        // call hook and eventually write initial score
        if( !this.hookDrawScorebar || !this.hookDrawScorebar(highlight) ) {
            this._scorebarScore.setString("Hello World++");
        } 
    },
	
    drawScorebarText: function(text,pos,size,color) {
		
		var label = new cc.LabelBMFont( text , "res/fonts/amtype"+size+".fnt" , cc.LabelAutomaticWidth, cc.TEXT_ALIGNMENT_LEFT ),
            rl = $42._rollingLayer;

		label.setPosition(pos);
        _42_retain(label, "label "+text);
		label.setColor(color);
		rl.addChild(label, 5);	
		
		return label;
	},
	
    drawScorebarWord: function(word,pos,wordSprite,scale) {
        var rl = $42._rollingLayer;

		if( !wordSprite ) {
			var wordFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe.png"),
				wordFrameSprite = cc.Sprite.create(wordFrameFrame),
				rect = wordFrameSprite.getTextureRect();
            _42_retain(wordFrameSprite,"wordFrameSprite "+word);	
			rect.width = word.length? word.length * $42.BS + $42.WORD_FRAME_WIDTH * 2 : 80;
			rect.height = word.length? $42.BS + $42.WORD_FRAME_WIDTH * 2 : 8;
			wordFrameSprite.setTextureRect(rect);
			wordFrameSprite.setPosition(pos.x,pos.y);
			wordFrameSprite.setScale(scale);
			rl.addChild(wordFrameSprite,4);
		} else {
			var wordFrameSprite = wordSprite,
				rect = wordFrameSprite.getTextureRect();
			rect.width = word.length? word.length * $42.BS + $42.WORD_FRAME_WIDTH * 2 : 80;
			rect.height = word.length? $42.BS + $42.WORD_FRAME_WIDTH * 2 : 8;
			wordFrameSprite.setTextureRect(rect);

			// remove old letters
			wordFrameSprite.removeAllChildren(true);
		}
		// add sprites of word
		for( var i=0 ; i<word.length ; i++) {
			
			var file = $42.LETTER_NAMES[$42.LETTERS.indexOf(word[i])],
				spriteFrame = cc.spriteFrameCache.getSpriteFrame(file+".png"),
				sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$42.BS,$42.BS));
			sprite.setPosition($42.BS/2+i*$42.BS+$42.WORD_FRAME_WIDTH,$42.BS/2+$42.WORD_FRAME_WIDTH);
			wordFrameSprite.addChild( sprite );
		}		
		
		return wordFrameSprite;
	},

    moveRollingLayer: function(stage, delay) {

        var self = this,
            rls = this._rollingLayerStage || 0;

		if( !this._layerIsRolling ) {
			
            if( stage && stage === rls ) return;

			if( stage !== undefined ) rls = stage;
			else rls = Math.min(++rls, $42.SCOREBAR_MAX_LAYER_SCROLL);
		
			this._layerIsRolling = true;
			$42._rollingLayer.runAction(
                cc.sequence(
                    cc.EaseSineOut.create(
                        cc.moveTo(1,cc.p(0,-rls*$42.BOXES_Y_OFFSET))
                    ),
					cc.callFunc(function() {
						self._layerIsRolling = false;
					})
                )
			);

            if( this._rollingTimeout ) clearTimeout(this._rollingTimeout);
            if( rls !== 0 ) {
                this._rollingTimeout = setTimeout( function() {
                    self.moveRollingLayer(0);
                    self._rollingTimeout = null;
                }, $42.SCOREBAR_SETBACK*1000 );
            }
		}

        this._rollingLayerStage = rls;
	},
	
    /////////////////////////////////////////////////////////////////////////////
    // initListeners works on the touch and keyboard inputs
    initListeners: function() {
       	var self = this;
	
       	if( true || 'touches' in cc.sys.capabilities ) { // touches work on mac but return false
	    	this._touchListener = cc.EventListener.create({
	            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
	            onTouchesBegan: function(touches, event, pos) {

	            	if( !pos || !pos.x === undefined ) {
		            	var touch = touches[0],
		            		loc = touch.getLocation();	            		
	            	} else {
	            		loc = pos;
	            	}
	                
	                self.touchStartPoint = {
	                	x: loc.x,
	                	y: loc.y
	                };
	                
	                self.touchLastPoint = {
	                    	x: loc.x,
	                    	y: loc.y
	                };	
	                
	                self.touchStartTime = new Date().getTime();
	            },
	            	
	            onTouchesMoved: function(touches, event, pos) {
	            	
	            	if( !pos || !pos.x === undefined ) {
		            	var touch = touches[0],
		            		loc = touch.getLocation();	            		
	            	} else {
	            		loc = pos;
	            	}
	                
	            	var start = self.touchStartPoint;
	
	                if( !loc || !start ) {
		                self.isSwipeUp = self.isSwipeLeft = self.isSwipeRight = self.isSwipeDown = false;	                			                
	                	return;
	                }
	                
	                self.touchDistance = {
	            			x: Math.abs(loc.x - start.x),
	            			y: Math.abs(loc.y - start.y)
	            	};
	                
	                // check for left
	                if( loc.x < start.x - $42.TOUCH_SWIPE_THRESHOLD) {
	                	// if direction changed while swiping left, set new base point
	                	if( loc.x > self.touchLastPoint.x ) {
	                		start = self.touchStartPoint = {
	                        		x: loc.x,
	                        		y: loc.y
	                        };
	                		self.isSwipeLeft = false;
	                	} else {
	                    	self.isSwipeLeft = true;                		
	                	}
	                }
	                
	                // check for right
	                if( loc.x > start.x + $42.TOUCH_SWIPE_THRESHOLD ) {
	                	// if direction changed while swiping right, set new base point
	                	if( loc.x < self.touchLastPoint.x ) {
	                		self.touchStartPoint = {
	                        		x: loc.x,
	                        		y: loc.y
	                        };
	                		self.isSwipeRight = false;
	                	} else {
	                    	self.isSwipeRight = true;                		
	                	}
	                }
	
	                // check for down
	                if( loc.y < start.y - $42.TOUCH_SWIPE_THRESHOLD * 3 ) {
	                	// if direction changed while swiping down, set new base point
	                	if( loc.y > self.touchLastPoint.y ) {
	                		self.touchStartPoint = {
	                        		x: loc.x,
	                        		y: loc.y
	                        };
	                		self.isSwipeDown = false;
	                	} else {
	                    	self.isSwipeDown = true;                		
	                	}
	                }
	
	                // check for up
	                if( loc.y > start.y + $42.TOUCH_SWIPE_THRESHOLD * 3 ) {
                    	self.isSwipeUp = true;                		
	                }
	                
	                self.touchLastPoint = {
	                		x: loc.x,
	                		y: loc.y
	                };
	            },
	            	
	            onTouchesEnded: function(touches, event, pos){
	            	//cc.log("onTouchesEnded!");
	
	            	if( !pos || !pos.x === undefined ) {
		            	var touch = touches[0],
		            		loc = touch.getLocation();	            		
	            	} else {
	            		loc = pos;
	            	}
	                
	                self.touchStartPoint = null;
	                
	                if(!self.isSwipeUp && !self.isSwipeLeft && !self.isSwipeRight && !self.isSwipeDown) {
	                	if( new Date().getTime() - self.touchStartTime > $42.LONG_TAP_TIME ) {
	    	                if( self.hookOnLongTap ) self.hookOnLongTap(loc);
	                	} else {
		                	self.isTap = true;
		                	if( self.hookOnTap ) self.hookOnTap(loc);

		                    if( loc.y < $42.BOXES_Y_OFFSET ) {
			                    self.moveRollingLayer(undefined,3);
                            }
	                	}
	                } else {
		                self.isSwipeUp = self.isSwipeLeft = self.isSwipeRight = self.isSwipeDown = false;	                			                
	                }
	            }
	        });
		    	
	    	cc.eventManager.addListener(this._touchListener, this);
	    } else {
	        cc.log("TOUCH_ALL_AT_ONCE is not supported");
	    }
       
		/*
		 * KEYBOARD EVENTS
		 */ 
       	
	    if( 'keyboard' in cc.sys.capabilities ) {
	        this._keyboardListener = cc.EventListener.create({
	            event: cc.EventListener.KEYBOARD,
	            onKeyPressed:function(key, event) {
	            	var tile = self.tiles[self.tiles.length-1],
	            		sprite = tile && tile.sprite;
	            	if( !sprite ) return;
	            	var pos = sprite.getPosition();
	            	switch(key) {
	            	case 'a':
	            	case $42.KEY_LEFT_CODE:
	            		self.touchStartPoint = { 
	            			x: pos.x,
	            			y: pos.y
	            		};
	        			self.touchLastPoint = {
	            			x: pos.x - $42.BS,
	            			y: pos.y
	            		};
	            		self.isSwipeLeft = true;
	            		break;
	            	case 's':
	            	case $42.KEY_RIGHT_CODE:
	            		self.touchStartPoint = { 
	            			x: pos.x,
	            			y: pos.y
	            		};
	        			self.touchLastPoint = {
	            			x: pos.x + $42.BS,
	            			y: pos.y
	            		};
	            		self.isSwipeRight = true;
	            		break;
	            	case $42.KEY_UP_CODE:
	            		self.isSwipeUp = true;
	            		break;
	            	case $42.KEY_DOWN_CODE:
	            		self.isSwipeDown = true;
	            		break;
	            	}
	            },
	            onKeyReleased:function(key, event) {
	            	switch(key) {
	            	case $42.KEY_LEFT_CODE:
		                self.touchStartPoint = null;
	            		self.isSwipeLeft = false;
	            		break;
	            	case $42.KEY_RIGHT_CODE:
		                self.touchStartPoint = null;
	            		self.isSwipeRight = false;
	            		break;
	            	case $42.KEY_UP_CODE:
	            		self.isSwipeUp = false;
	            		break;
	            	case $42.KEY_DOWN_CODE:
	            		self.isSwipeDown = false;
	            		break;
	                }
	            }
	        }, this);
	        cc.eventManager.addListener(this._keyboardListener, this);
	    } else {
	         cc.log("KEYBOARD is not supported");
	    }
    },
    
    //////////////////////////////////////////////////////////////////////////////////////
    // Stopps touch and keyboard events
    //
    stopListeners: function() {
        if( this._touchListener ) cc.eventManager.removeListener(this._touchListener);
        if( this._keyboardListener ) cc.eventManager.removeListener(this._keyboardListener);
    },

    ///////////////////////////////////////////////////////////////////////////////////////
    // Form a aggregated tile sprite
    //
    // p is the position
    //
	buildTile: function(p) {
		
        ////////////////////////////
		// select a random tile type
		var self = this,
			newTile = self.hookSetTile? self.hookSetTile() : this.getRandomValue($42.TILE_OCCURANCES),
			tileBoxes = $42.TILE_BOXES[newTile],
			userData = {};
		
        //////////////////////////////
		// set tile sprite to a column
		p.x = Math.round(p.x/$42.BS)*$42.BS+(32-(Math.abs(tileBoxes[0].x)%$42.BS));
		cc.assert(p.x%($42.BS/2) === 0, "_42, buildTile: Tile is not aligned to column.");

        //////////////////////////////
        // Get tile images from a hook or ...
		if( this.hookSetTileImages ) {
			var tileSprite = this.hookSetTileImages(tileBoxes, p, userData);
		}
        //////////////////////////////
        // draw plain vanilla tiles
		else {
			// create sprite for tile and set is size 0, we only use its position and rotation
			var tileSprite = cc.Sprite.create(res.tiles_png,cc.rect(0,0,0,0));
			
			_42_retain(tileSprite, "buildTile: tileSprite");
	        tileSprite.setPosition(p);
	        self.addChild(tileSprite);

	        // add single boxes with letters to the tile
	        for( var i=0 ; i<tileBoxes.length ; i++) {
	        	
	    		spriteFrame = cc.spriteFrameCache.getSpriteFrame(newTile+".png"),
	    		sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$42.BS,$42.BS));

	    		_42_retain(sprite, "builTile: sprite "+i);
	        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
	        	sprite.setRotation(-$42.INITIAL_TILE_ROTATION);
		        tileSprite.addChild(sprite);
	        }			
		}
        
        //////////////////////////
        // build a tile object
        this.tiles.push({
        	boxes: tileBoxes,
        	sprite: tileSprite,
        	rotation: $42.INITIAL_TILE_ROTATION,
        	direction: 0,  // 0: not moving, -1: left, 1: right 
        	isRotating : false,
        	action: null,
        	fallingSpeed: $42.FALLING_SPEED,
        	userData: userData
        });
        
        tileSprite.setRotation($42.INITIAL_TILE_ROTATION);
		rt = this.rotateBoxes(this.tiles[this.tiles.length-1]);
		
		// play sound
		cc.audioEngine.playEffect(res.plopp_mp3);
	},
	
    ///////////////////////////////////////////////////////////////////
    // getRandomValue returns a weighted random number
    //
	getRandomValue: function(occs, sum) {
		
		if( !sum ) for( var i=0, sum=0 ; i<occs.length ; i++ ) sum += occs[i];
		
		var rnd = Math.round(Math.random()*sum),
			r = 0, i = 0;
		while(r <= rnd) {
			if( r+occs[i] >= rnd ) break;
			
			r+=occs[i++];
		}		
		return i;
	},
	
    ///////////////////////////////////////////////////////////////////////
    // rotateBoxes rotates the boxes array 
    //
	rotateBoxes: function(t) {
		var r = t.rotation % 360,
		rb = []; // rotated boxes
	
		for( var i=0 ; i<t.boxes.length ; i++ ) {
			switch(r) {
			case 0:
				// 0 degree: no change
				rb.push({
					x: t.boxes[i].x,
					y: t.boxes[i].y
				});
				break;
			case 90:
				// 90 degree: exchange x and y coordinates
				rb.push({
					x: t.boxes[i].y,
					y: -t.boxes[i].x
				});
				break;
			case 180:
				// 180 degree: negate x and y (= rotate)
				rb.push({
					x: -t.boxes[i].x,
					y: -t.boxes[i].y
				});
				break;
			case 270:
				// 90 degree: exchange x and y coordinates and negate
				rb.push({
					x: -t.boxes[i].y,
					y: t.boxes[i].x
				});
				break;
			}
		}
		t.rotatedBoxes = rb;
	},
	
    //////////////////////////////////////////////////////////////////////////
    // update is called 60 times a second and e.g. moves the tiles
    //
    update: function(dt) {
    	
    	var self = this,
			size = this.size;
    	
    	// tmp log
    	$42.msg1.setString("Nodes: "+this.getChildren().length);

    	/////////////////////////////////////
    	// Internal function: get current row / col of a box
    	var getRowCol = function(box, lp) {
    		return {
    			col: Math.floor((lp.x + box.x - $42.BOXES_X_OFFSET) / $42.BS),
    			row: Math.floor((lp.y + box.y - $42.BOXES_Y_OFFSET - $42.BS/2) / $42.BS),
    		};
    	};
    	
    	/////////////////////////////////////
    	// Internal function: check if a collision happened
    	var checkForBottom = function(t, lp) {
    		var b = t.rotatedBoxes; // usually four boxes of a tile
    		
            /////////////////////
    		// check all boxes individually
    		for( var i=0 ; i<b.length ; i++ ) {
    			var bx = lp.x + b[i].x,		// x pos of box
    				by = lp.y + b[i].y,		// y pos of box
    				brc1 = getRowCol(b[i], { x: lp.x + $42.BS/2 - 1, y: lp.y}), 
    				brc2 = getRowCol(b[i], { x: lp.x - $42.BS/2 + 1, y: lp.y}); 
    			if( by - $42.BS/2 <= $42.BOXES_Y_OFFSET ||    // bottom reached? 
    				(brc1.row < $42.BOXES_PER_COL && (self.boxes[brc1.row][brc1.col] || self.boxes[brc2.row][brc2.col])) ) { // is there a fixed box under the moving box?

    				// align y to box border
                    cc.log("checkForBottom --- brc1.col: "+brc1.col+", brc2.col: "+brc2.col);
    				lp.y = Math.round((lp.y - $42.BOXES_Y_OFFSET)/($42.BS/2))*($42.BS/2) + $42.BOXES_Y_OFFSET;
    				
    				// fix tile
    				if( !t.isDragged && !t.isRotating ) return fixTile(t, lp);
    			}
    		}

    		return false;
    	};
    	
        //////////////////////////////////////
        // Internal function: Move tile left or right
    	var moveHorizontalyAndCheckForBarrier = function(t, lp, tp) {
    		var b = t.rotatedBoxes,					// usually four tile boxes
    			op = t.offsetToStartPoint, 			// distance of user finger to sprite center when grabbing a tile 
    			offset = 32-(Math.abs(t.rotatedBoxes[0].x) % $42.BS),
    			dir = Math.sign(tp.x-lp.x+op.x);  	// direction, left = -1
    		
			// limit horizontal movement to little less than one box per cycle
			lp.x = (Math.abs(tp.x - lp.x + op.x) < $42.BS)? tp.x + op.x : lp.x + ($42.BS-1) * dir;
			
			// move tile to center of user finger in snap speed
			if( Math.abs(op.x) > 0 ) op.x = Math.sign(op.x) * Math.max(Math.abs(op.x) - $42.SNAP_SPEED, 0);

			var newX = null;
			// check all (four) boxes
    		for( var i=0 ; i<t.boxes.length ; i++) {
    			
        		var brc1 = getRowCol(b[i], { x: lp.x-$42.BS/2, y: lp.y+$42.BS-1} );
        		var brc2 = getRowCol(b[i], { x: lp.x-$42.BS/2, y: lp.y+1} );
    			// check for left and right border
    			if( dir === -1 ) {
    				// left border?
    				if (lp.x + t.rotatedBoxes[i].x - $42.BS/2 - $42.BOXES_X_OFFSET < 0 ) {
    					var x = -t.rotatedBoxes[i].x + $42.BS/2 + $42.BOXES_X_OFFSET;
    					// take the tile that is the most left
    					newX = (newX === null)? x : Math.max(newX , x);
    				}
    				
    				// box on the left side?
    				if( self.boxes[brc1.row][brc1.col] || self.boxes[brc2.row][brc2.col] ) {
        				cc.log("_42, moveHorizontalyAndCheckForBarrier: Correcting box! brc1: "+JSON.stringify(brc1)+
                                                                                     ", brc2: "+JSON.stringify(brc2));
    					var x = (brc1.col+1) * $42.BS - t.rotatedBoxes[i].x + $42.BS/2 + $42.BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.max(newX , x);
    				}
    			} else {
    				if (lp.x + t.rotatedBoxes[i].x + $42.BS/2 - $42.BOXES_X_OFFSET >= $42.BOXES_PER_ROW * $42.BS ) {
    					var x = $42.BOXES_PER_ROW * $42.BS - t.rotatedBoxes[i].x - $42.BS/2 + $42.BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.min(newX , x);
    				}

    				if( self.boxes[brc1.row][brc1.col+1] || self.boxes[brc2.row][brc2.col+1]  ) {
    					var x = brc1.col * $42.BS - t.rotatedBoxes[i].x + $42.BS/2 + $42.BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.min(newX, x);
    				}
    			}
    		}
    		
    		if( newX ) {
    			lp.x = newX;
                cc.log("New x: "+lp.x);
    		}
    		
    		return true;
    	};
    	
        //////////////////////////////////////
        // Internal function: Align tile gently to a column 
		var alignToColumn = function(t, lp, doneFn) {
			var tileOffset = $42.BS/2 - Math.abs(t.rotatedBoxes[0].x%$42.BS),
				offset = (lp.x-$42.BOXES_X_OFFSET-tileOffset)%$42.BS;
				
			offset = offset < $42.BS/2? -offset : $42.BS - offset;
			
			if( t.isRotating && t.rotation%180 ) offset = -offset;
				
			var targetX = lp.x + offset;
			
			if( offset ) {
				t.isAligning = true;
				t.sprite.runAction(cc.sequence( 
					cc.moveBy($42.MOVE_SPEED,cc.p(offset,0)),
					cc.callFunc(function() {
		    			var lp = t.sprite.getPosition();
		    			t.sprite.setPosition(targetX, lp.y);
		    			t.isAligning = false;
		    			if( doneFn && typeof doneFn === "function" ) doneFn();
					}, self)
				));						
			} else {
				if( doneFn && typeof doneFn === "function" ) doneFn();
			}
		};
    	
        //////////////////////////////////////////
        // Internal function: Rotate tile
    	var rotateTile = function rotate(t,lp) {
			var oldRotation = t.rotation;
			t.rotation = (t.rotation + 90)%360;
			self.rotateBoxes(t);
	
			// shift Tile if it needs to be align to column after rotation
			var check = checkRotation(t, lp);
			
			if( check != "collision" ) {
				// shift tile, if it would not fit into playground after rotation
				var shiftTile = -(parseInt(check) || 0);
				
				if(shiftTile != 0) {
					var targetX = lp.x + shiftTile;
					t.direction = Math.sign(shiftTile);
					if( t.direction ) {
						t.isAligning = true;
						t.sprite.runAction(cc.sequence( 
								cc.moveBy($42.MOVE_SPEED*2,cc.p(shiftTile,0)),
								cc.callFunc(function() {
					    			var lp = t.sprite.getPosition();
					    			t.sprite.setPosition(targetX, lp.y);
					    			t.direction = 0;
									t.isAligning = false;
								}, self)
						));						
					}
				} else {
					alignToColumn(t, lp);
				}
				
				// play sound
				//cc.audioEngine.playEffect(res.klack_mp3);

				t.sprite.runAction(cc.sequence( 
						cc.rotateTo($42.MOVE_SPEED*2,t.rotation),
						cc.callFunc(function() {
							t.isRotating = false;
						})));
				for( var i=0 ; i<t.sprite.children.length ; i++ ) {
					t.sprite.children[i].runAction(cc.rotateTo($42.MOVE_SPEED*2,(360-t.rotation)%360));					
				}	
					       		
				
				return true;
			} else {
				t.isRotating = false;
				t.rotation = oldRotation;
				self.rotateBoxes(t);  
				
				return false;
			}
    		
    	};
    	
        /////////////////////////////
        // Internal function: Look if rotation is possible, 
    	var checkRotation = function(t, lp, evade) {
    		
    		var b = t.rotatedBoxes,
    			minOffset = 0,
    			maxOffset = 0;
    		
    		// check if tile could be in the new position
    		for( var i=0 ; i<b.length ; i++) {
        		var brc = getRowCol(b[i], lp);
        		
        		// record left and right extremes
        		minOffset = Math.min(minOffset, lp.x + b[i].x - $42.BOXES_X_OFFSET - $42.BS/2);
        		maxOffset = Math.max(maxOffset, lp.x + b[i].x - $42.BOXES_X_OFFSET + $42.BS/2);
        		
        		// check if other tiles are at the play
        		if( brc.row < 0 || self.boxes[brc.row][brc.col] ) {
        			var offset,move;
        			if( !evade && 
        				((move = -$42.BS/2, offset = checkRotation( t , {x:lp.x + move , y:lp.y}  , true )) !== "collision" || 
        				 (move =  $42.BS/2, offset = checkRotation( t , {x:lp.x + move , y:lp.y}  , true )) !== "collision") )
        				 return (offset==="ok"?0:offset)-move;
        			
        			else return "collision";
        		}
    		}
    		
    		if( minOffset < 0 || maxOffset > $42.BOXES_PER_ROW * $42.BS ) {
    			var offset = minOffset? minOffset : maxOffset - $42.BOXES_PER_ROW * $42.BS,
    				newLp = {
    					x: lp.x - offset,
    					y: lp.y
        			};
    				
    			if( checkRotation(t , newLp , true ) === "ok" ) return offset;
    			else return "collision";
    		} 
    			
    		return "ok";
    	};
    	
    	//////////////////////////////////
    	// Internal function: fix tile to the ground
    	var fixTile = function fixTileFn(t, lp) {
    		var b = t.rotatedBoxes,
    			newBrcs = [],
    			ret = "ok";
    		
    		// check if a tile is too high
    		for( var i=0,minRow ; i<b.length ; i++ ) {
				var brc = getRowCol(b[i], lp);

                minRow = Math.min(minRow || brc.row, brc.row);
				if( brc.row < 0 /*|| self.boxes[brc.row][brc.col] != null*/ ) {
					// if a box is occupied already, move tile one up 
					return fixTileFn(t, {x:lp.x,y:lp.y+$42.BS});
				}

                if( self.boxes[brc.row][brc.col] ) {
                    var boxesMod = [];
                    for( var i=0; i<$42.BOXES_PER_COL ; i++ ) {
                        boxesMod.push([]);
                        for( var j=0; j<$42.BOXES_PER_ROW ; j++ ) {
                            var box = self.boxes[i][j];
                            boxesMod[i][j] = box? {
                                words: box.words,
                                userData: box.userData
                            }: null;
                        }
                    }
                    cc.log(!self.boxes[brc.row][brc.col], "fixTile: Problem fixing tile at pos "+JSON.stringify(lp)+" at brc "+JSON.stringify(brc)+" with "+JSON.stringify(boxesMod));
                }
            }

            if( minRow >= $42.GAME_OVER_ROW ) ret = "gameover";
    		
    		// fix single boxes of tile
    		if( ret !== "gameover" ) {
                cc.log("minRow = "+minRow);
        		for( var i=0 ; i<b.length ; i++) {
            		// create a new sprite from the old child sprite
        			var sprite = t.sprite.children[i],
        				newSprite = cc.Sprite.create(sprite.getTexture(), sprite.getTextureRect());

        			_42_retain(newSprite, "box sprite"+i);
        			
        			// Insert into boxes array
    				var brc = getRowCol(b[i], lp);
    				newBrcs.push(brc);
        			
        			newSprite.setPosition($42.BOXES_X_OFFSET + brc.col*$42.BS + $42.BS/2 , $42.BOXES_Y_OFFSET + brc.row*$42.BS + $42.BS/2);
        	        self.addChild(newSprite);

            		self.boxes[brc.row][brc.col] = {
            			sprite: newSprite,
            			userData: t.userData && typeof t.userData === "object" && t.userData[i] || t.userData
            		};     					
        		}    			
    		} else {
                cc.log("GAME OVER! Row = "+minRow);
            }
    		
    		var tileRet = false;
    		if( self.hookTileFixed ) tileRet = self.hookTileFixed(newBrcs);
            else self.pauseBuildingTiles = false;

    		if( !tileRet ) {
    			self.checkForAndRemoveCompleteRows();
        		if( self.hookTileFixedAfterRowsDeleted ) self.hookTileFixedAfterRowsDeleted();
    		}

    		self.removeChild(t.sprite);
       		
    		return ret;
    	};
    
        /////////////////////////////////////////
        // Layer function: Check if a row is complete and remove it     
    	self.checkForAndRemoveCompleteRows = function(rowToDelete) {
    		
    		// always check all rows (for now)
    		var rowsDeleted = [];
    		for( var i=0 ; i<$42.BOXES_PER_COL ; i++ ) {
    			for( j=0 ; j<$42.BOXES_PER_ROW ; j++ ) {
    				if(!self.boxes[i][j]) break;
    			}
    			if(j === $42.BOXES_PER_ROW || rowToDelete === i) {
    				self.deleteRow(i);
    				rowsDeleted.push(i);
    			}
    		}
    		
    		// move rows above deleted rows down
    		if( rowsDeleted.length ) {

    			var colsToCorrect = [],
    				prevColBlocked, curColBlocked;
    			
    			colsToCorrect[0] = false;

    			// play sound
    			cc.audioEngine.playEffect(res.ritsch_mp3);

    			for( var i=0 ; i<$42.BOXES_PER_ROW ; i++ ) {
    				var rd = [];
    				for( var j=0 ; j<rowsDeleted.length ; j++) {
    					
        				// don't delete a box when it wasn't actually deleted (though it's row was)  
    					if( self.boxes[rowsDeleted[j]][i] === null ) {
    						rd.push(rowsDeleted[j]);
    					}
    				}
    				
    				// mark transitions between blocked and non blocked columns
    				curColBlocked = rowsDeleted.length != rd.length;
    				if( i !== 0 && curColBlocked !== prevColBlocked ) colsToCorrect[i-1] = colsToCorrect[i] = true;
    				else colsToCorrect[i] = false;    			
    				prevColBlocked = curColBlocked; 
    				
	    			var r = 0,
					rows = 1,
					row = rd[0],
					nextRow = rd[++r] || null;

	    			// move boxes down caused by rows deleted
	    			if( rd.length > 0 ) {
		    			for( var j=row ; j<$42.BOXES_PER_COL ; j++ ) {

	    					while( j+rows == nextRow ) {
	    						nextRow = rd[++r] || null;
	    						rows++;
	    					}

							var sprite = (self.boxes[j+rows] && self.boxes[j+rows][i] && self.boxes[j+rows][i].sprite) || null;
							if( sprite ) {
								sprite.runAction(cc.moveBy($42.MOVE_SPEED*rows, cc.p(0,-$42.BS*rows)));
							}    						

							self.boxes[j][i] = (self.boxes[j+rows] && self.boxes[j+rows][i]) || null;    
							
							if( self.hookMoveBoxDown ) self.hookMoveBoxDown({row:j,col:i},{row:j+rows,col:i});
	    				}	   
	    			}
    			}

    			// move boxes down caused by having no neighbor boxes any more
    			for( var i=0 ; i<$42.BOXES_PER_ROW ; i++ ) {
    				if( colsToCorrect[i] ) {
    					for( var j=rowsDeleted[0] ; j < $42.BOXES_PER_COL ; j++ ) {
    						// check if box have no neighbors left
    						if( self.boxes[j][i] && 
       							( j>0 && !self.boxes[j-1][i] ) && 
    							( j==$42.BOXES_PER_COL-1 || !self.boxes[j+1][i] ) && 
    							( i==0 || !self.boxes[j][i-1] ) && 
    							( i==$42.BOXES_PER_ROW-1 || !self.boxes[j][i+1] ) ) {
    							
    							// check how far it should fall
    							for( var k=j-2 ; k>=0 ; k-- ) if( self.boxes[k][i] ) break;
    							k++; // destination row is one above
    							
    							// move the sprite
    							cc.assert(self.boxes[j][i],"Box must be filled.")
    							var sprite = self.boxes[j][i].sprite;
    							if( sprite ) {
    								sprite.runAction(cc.moveBy($42.MOVE_SPEED*(j-k), cc.p(0,-$42.BS*(j-k))));
    							}    						

    							// move the box
    							self.boxes[k][i] = self.boxes[j][i];
    							self.boxes[j][i] = null;
    							
    							cc.log("42Words, checkForAndRemoveCompleteRows: Move box from ("+i+","+j+") to ("+i+","+k+")");
    						}
    					}
    				}
    			}
    			
    			if( self.hookAllBoxesMovedDown ) self.hookAllBoxesMovedDown(rowsDeleted.length);
    		}
    	};
    	
        //////////////////////////////////////////
        // Layer function: Delete a row
    	self.deleteRow = function(row, deleteAnyway) {

        	// delete row ... 
        	for( var i=0 ; i<$42.BOXES_PER_ROW ; i++ ) {
		    	if( deleteAnyway || !self.hookDeleteBox || self.hookDeleteBox({row:row,col:i}) ) {
		    		
	        		// destroy sprite and box  
		    		if( self.boxes[row][i] ) {
		    			_42_release(self.boxes[row][i].sprite);
	    				
		            	self.removeChild(self.boxes[row][i].sprite);
		            	self.boxes[row][i].sprite = null;
				    	self.boxes[row][i] = null;		
				    	
			            // particle emitter
			            var emitter = new cc.ParticleSystem( res.particle_lavaflow );
			            emitter.x = $42.BOXES_Y_OFFSET + i * $42.BS - $42.BS/2;
			            emitter.y = $42.BOXES_Y_OFFSET + row * $42.BS + $42.BS/2;
			            _42_retain(emitter, "Emitter");
			            emitter.setAngle(Math.random()*360);
			            self.addChild(emitter);
			            
			            emitter.runAction(
			            	cc.sequence(
			            		cc.delayTime(0.15 + Math.random()*0.05),
			            		cc.callFunc(function() {
			            			this.stopSystem();
			            		},emitter),
			            		cc.delayTime(3.0),
			            		cc.callFunc(function() {
			            			_42_release(this);
			            			self.removeChild(this);
			            		},emitter)
			            	)
			            );

		    		}
		    	}
    		}           	
    	};

        /////////////////////////////
        // Internal function: 
        var isSwipe = function() {
        	return self.isSwipeLeft || self.isSwipeRight || self.isSwipeUp || self.isSwipeDown;
        }

        //////////////////////////////////////////////////////77/
    	// Actual update functionality starts here ... beginning by calling hook update function
    	if( self.hookUpdate ) self.hookUpdate(dt);
    	
        /////////////////////////////////////
    	// if there is no tile flying right now, build a new one
        var tilesFlying = self.tiles.filter(function(value) { return value !== undefined }).length;
        if( !tilesFlying && !this.pauseBuildingTiles ) {
            self.buildTile(cc.p(Math.random()*($42.BOXES_PER_ROW-4)*$42.BS+$42.BOXES_X_OFFSET+2*$42.BS, size.height+$42.BS)); 
        }
        
    	/////////////////////////////////////
    	// Main loop to move tiles (function is built to be able to move more than one tile at once, but it is not used)
    	for( tile in self.tiles ) {
    		var t = self.tiles[tile],
    			lp = t.sprite.getPosition(),
    			sp = self.touchStartPoint,
    			tp = self.touchLastPoint;
    		
    		lp.x = Math.round(lp.x); // align x (positions manipulated by MoveBy seem to be not precise)

    		////////////////////////////////////////
    		// Move tile left and right
    		if( !t.isDragged && !t.isAligning ) {

    			if( !t.isRotating ) {
                    /////////////////////////////////////
                    // swipe up rotates a tile
    	    		if( self.isSwipeUp ) {
        				
        				t.isRotating = true;
        				t.fallingSpeed = $42.FALLING_SPEED;
        				
        				rotateTile(t , lp);
                    /////////////////////////////////////
                    // swipe down let a tile fall
    	    		} else if( self.isSwipeDown && !sp || self.isSwipeDown &&
    		    			sp.x < lp.x + $42.BS*2 && sp.x > lp.x - $42.BS*2 &&
    		    			sp.y < lp.y + $42.BS*2 && sp.y > lp.y - $42.BS*2) {
    	    			t.fallingSpeed = $42.FALLING_SPEED * 36;
    	    		}			
    			}
    			
    			if( !t.isRotating && isSwipe() && sp &&
                    /////////////////////////////////
                    // Grab a tile
	    			sp.x < lp.x + $42.BS*2 && sp.x > lp.x - $42.BS*2 &&
	    			sp.y < lp.y + $42.BS*2 && sp.y > lp.y - $42.BS*2	) { // move the tile if the touch is in range
	  
	    			t.isDragged = true;
	    			t.offsetToStartPoint = {
	    				x: lp.x - sp.x,
	    				y: lp.y - sp.y
	    			}
	    		} 
    			
    			if( !self.isSwipeDown ) {
                    ////////////////////////////////////////
    	    		// go back to normal falling speed if tile is not dragged
    	    		if( lp.y < size.height - $42.BS ) {
    	    			t.fallingSpeed = $42.FALLING_SPEED;
    	    		} else {
    	    			t.fallingSpeed = $42.FALLING_SPEED * 36;
    	    		}
    			}

    		} else {

    			if( self.touchStartPoint == null ) {
                    /////////////////////
    				// align to column if player does't touch the tile
    				if( !t.isAligning ) {
    					
        				alignToColumn(t,lp,function() {
        					t.isDragged = false;    					
        				});	
    				}
    			} else {
                    ///////////////////////
                    // Move tile if she touches it
    				if( !t.isAligning ) {
        	    		moveHorizontalyAndCheckForBarrier(t,lp,tp);   
    				}
        			
    	    		if(tp.y < lp.y - $42.BS*2 && !t.isRotating) {
    	    			t.fallingSpeed = Math.max( Math.min($42.FALLING_SPEED * 36, lp.y - $42.BS*2 - tp.y) , $42.FALLING_SPEED);
    	    		} else {
    	    			t.fallingSpeed = $42.FALLING_SPEED;
    	    		}
    			}
    		}
    		
    		if( self.isTap ) {
    			self.isTap = false;
    			t.fallingSpeed = $42.FALLING_SPEED;
    		}
    			    	
            //////////////////////////////
    		// let tile fall down
    		lp.y -= t.fallingSpeed;
    		
            //////////////////////////////
            // Check for bottom
    		var ret;
            self.pauseBuildingTiles = true;
    		if( ret = checkForBottom(t, lp) ) {
                //////////////////////////////////////////
    			// tile landed, release and delete it ...
    			var t = self.tiles[tile].sprite,
    				ch = t.getChildren();
    			_42_release(t);
    			for(var i=0 ; i<ch.length; i++) _42_release(ch[i]);
    			delete self.tiles[tile];

                //////////////////////////////////
                // Check for game over (preliminary, still can be revoked)
    			if( ret == "gameover" ) {

    				var menuItems = [];
        			if( !this.lastGameOverTime || this.lastGameOverTime < new Date().getTime() - 1000 ) {
        				
                        ///////////////////////7
                        // Ask player if to go on
        				menuItems.push({
        					label: $42.t.reached_top_continue, 
        					cb: function(sender) {
        				        self.resume();
        				        self.scheduleUpdate();

        				        this.exitMenu();
        			            this.getParent().removeChild(this);
        			            
        	        			self.lastGameOverTime = new Date().getTime();
        			        }
        				});
        			} 
        			
                    //////////////////////////
                    // Ask the player to end game
        			menuItems.push({
    					label: $42.t.reached_top_end_game, 
    					cb: function(sender) {
    						if( self.hookEndGame ) self.hookEndGame();
    						
    						self.endGame();
    				        this.exitMenu();
    			            this.getParent().removeChild(this);
    			        	cc.director.runScene(new _42Scene());
    			        }
    				});
        			
    	            this.getParent().addChild(
    	            	new _42MenuLayer("",menuItems),
    	            	2);
        	        this.pause();
        	        this.unscheduleUpdate();
    			}
    	        
    		} else {
        		
        		t.sprite.setPosition(lp);    			
    		};
    	}
    }
});

///////////////////////////////////////////////////////////////////////////////////////7
// The Menu Layer
var _42MenuLayer = cc.LayerColor.extend({
    
    ///////////////////////////////////
    // ctor is the init function
    //
    ctor:function (question, menuItems) {
        var size = this.size = cc.director.getWinSize(),
    	self = this;            
        
        this._super(new cc.Color(40,0,0,160),size.width,size.height);

        this.initMenu(question, menuItems);
		
        return true;
    },

    //////////////////////////////////////
    // initMenu init the actual menu
    //
	initMenu: function(questions, menuItems) {
		
        var size = this.size,
        	self = this,
        	items = [];

        ////////////////////
        // Show question
        if( typeof questions === "string") questions = [questions];
        for( var i=0 ; i<questions.length ; i++ ) {
    		var q = cc.LabelTTF.create(questions[i], "Arial", 36),
	    	x = size.width/2,
	    	y = size.height/2 + menuItems.length * 96 + (questions.length-i-1) * 64;
	
			q.setPosition(x,y);
			this.addChild(q, 1);        	
        }
        
        ////////////////////
        // Show menu items
        for( var i=0 ; i<menuItems.length ; i++ ) {
            items[i] = new cc.MenuItemFont(menuItems[i].label, menuItems[i].cb, this);
            items[i].setFontSize(48);        	
        }

        /////////////////////
        // Create menu
        var menu = cc.Menu.create.apply(this, items);
        menu.x = size.width/2;
        menu.y = size.height/2;
        this.addChild(menu, 1, $42.TAG_MENU_MENU);       

        menu.alignItemsVerticallyWithPadding(40);
	},
    
    exitMenu: function() {
    	
    }
});

//////////////////////////////////////////////////////////////////////////////////
// The Title layer of the game
//
var _42TitleLayer = cc.Layer.extend({
    
	letters: [],
	
    ctor:function () {
        this._super();

        var self = this,
        	size = this.size = cc.director.getWinSize();

        cc.width  = cc.director.getWinSize().width;
        cc.height = cc.director.getWinSize().height;

		var addImage = function(options) {
			var sprite = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame(options.image) || options.image);
			sprite.setPosition(options.pos || cc.p(size.width/2,size.height/2));
			sprite.setOpacity(options.opacity !== undefined? options.opacity : 255);
			sprite.setScale(options.scale !== undefined? options.scale : 1);
			sprite.setRotation(options.rotation || 0);
			_42_retain(sprite, "Title sprite ");
	        (options.parent || self).addChild(sprite, 0);
	        return sprite;
		};
		
		var addText = function(options) {
			var label = cc.LabelTTF.create(options.text, _42_getFontName(res.exo_regular_ttf) , options.size);
			label.setPosition(options.pos || cc.p(size.width/2,size.height/2));
			label.setColor(options.color || cc.color(0,0,0));
			label.setOpacity(options.opacity !== undefined? options.opacity : 255);
			label.setRotation(options.rotation || 0);
			label.setScale(options.scale !== undefined? options.scale : 1);
			_42_retain(label, "Title text label");	
	        (options.parent || self).addChild(label, 0);
	        return label;
		};
		
        var background = cc.Sprite.create(res["background"+("0"+$42.currentLevel).slice(-2)+"_png"]);
		var titleBg = addImage({
			image: res["title_png"], 
			opacity: 0,
            scale: 1.1,
		});

        var _42 = addText({
            text: "42",
            pos: cc.p(310, 870),
            color: cc.color(59,136,134),
            size: 390,
            opacity: 0,
            parent: titleBg
        });

        var titleTitle = addText({
            text: $42.t.title_title,
            pos: cc.p(cc.width/2, 635),
            color: cc.color(215,173,10),
            size: 130,
            opacity: 0,
            parent: titleBg
        });

        titleBg.runAction(
            cc.fadeIn(2)
        );

        _42.runAction(
            cc.fadeIn(5)
        );

        titleTitle.runAction(
            cc.fadeIn(5)
        );
		
        // Show menu items
		var addMenu = function(name, fontSize, color, cb) {
	        var item = new cc.MenuItemFont(name, cb, self);
	        item.setFontName(_42_getFontName(res.exo_regular_ttf));        	
	        item.setFontSize(fontSize);  
	        item.setColor(color);
	        
	        return item;
		}
		
        var item1 = addMenu($42.t.title_start, 60 , cc.color(115,63,78) ,  function() {
        	// start game layer
        	self.getParent().addChild(new _42GameLayer(), 1, $42.TAG_GAME_LAYER);

            titleBg.runAction(
                cc.sequence(
                    cc.fadeOut(1),
                    cc.callFunc(function() {
                        titleBg.removeChild(menu);
                        self.removeChild(titleBg);
                    })
                )
            );

            _42.runAction(
                cc.fadeOut(1.2)
            );

            titleTitle.runAction(
                cc.fadeOut(1.2)
            );

            menu.runAction(
                cc.fadeOut(1.2)
            );

        }, self);
	
        var ls = cc.sys.localStorage;
        $42.wordTreasureWords = ls.getItem("wordTreasureWords") || 0;
        $42.maxPoints = ls.getItem("maxPoints") || 0;
        $42.bestTime = ls.getItem("bestTime") || null;
        var item2 = addMenu($42.maxPoints? $42.t.title_hiscore+": "+$42.maxPoints : " ", 36 , cc.color(173,141,93) , function() {
        	cc.director.runScene(new _42Scene());
        });
        var item3 = addMenu($42.wordTreasureWords? $42.t.title_words+": "+$42.wordTreasureWords : " ", 36 , cc.color(173,141,93) , function() {
        	// can be filled
        });
        var item4 = addMenu($42.bestTime? $42.t.title_besttime+": "+($42.bestTime/3600>>>0)+":"+("0"+($42.bestTime/60>>>0)%60).substr(-2,2) : " ", 36 , cc.color(173,141,93) , function() {
        	// can be filled
        });

        var menu = cc.Menu.create.apply(this, [item1, item2, item3, item4] );
        menu.x = size.width/2;
        menu.y = 290;
        menu.setOpacity(0);
        titleBg.addChild(menu, 10);       
        menu.alignItemsVerticallyWithPadding(20);
        menu.runAction(cc.EaseSineIn.create(cc.fadeIn(4)));

        return true;
    },
    
    exitTitle: function() {
    	
    	// release title graphics
 		var node = this.getChildByTag($42.TAG_TITLE_BACKGROUND);
		if( node ) _42_release(node);
		
		node = node.getChildren()[0];
		if( node ) _42_release(node);

/* 		node = this.getChildByTag($42.TAG_TITLE_4);
		if( node ) node.release();
		delete tmpRetain[node.__instanceId];

 		node = this.getChildByTag($42.TAG_TITLE_2);
		if( node ) node.release();
		delete tmpRetain[node.__instanceId];

 		node = this.getChildByTag($42.TAG_TITLE_WORD);
		if( node ) node.release();
		delete tmpRetain[node.__instanceId];*/

		var nodes = node.getChildren();
		for( var i=0 ; i<nodes.length ; i++ ) {
			if( nodes[i] ) _42_release(nodes[i]);
		}
    }
});

var _42_retained = [];
var _42_retain = function(obj,name) {
    obj.retain();

	obj.__retainId = _42_getId();

	_42_retained[obj.__retainId] = name;
	//cc.log("Retaining "+obj.__retainId+": '"+_42_retained[obj.__retainId]+"'");
};

var _42_release = function(obj) {
    
    if( !obj ) debugger;
	cc.assert(obj && _42_retained[obj.__retainId], "_42_release: Object '"+obj.__retainId+"' not valid or not in retained array...");
	if( obj && _42_retained[obj.__retainId] ) {
        obj.release();
	    //cc.log("Releasing "+obj.__retainId+": '"+_b_retained[obj.__retainId]+"'");

	    delete _42_retained[obj.__retainId];
    }
};

var _42_IdFactory = function() {
	var id = 1000;

	return function() {
		return ++id;
	}
}
var _42_getId = _42_IdFactory();

var _42_getFontName = function(resource) {
    if (cc.sys.isNative) {
        return resource.srcs[0];
    } else {
        return resource.name;
    }
}


var _42Scene = cc.Scene.extend({
	
    onEnter:function () {
        var self = this;

        this._super();

        this.loadWords(function() {
            self.addChild(new _42TitleLayer(), 2, $42.TAG_TITLE_LAYER);
        });
    },

    loadWords: function(cb) {
        
        var lg = $42.languagePack = cc.loader.getRes(res.language_pack),
            lv = $42.letterValues = cc.loader.getRes(res.language_letters),
            pv = $42.prefixValues = cc.loader.getRes(res.language_prefixes),
            w  = $42.words = cc.loader.getRes(res.language_words),
            letters = $42.LETTERS;

        $42.t = lg.apptext;

        // Prepare letters (order them, calculate frequency out of letter value)
        var max=0;
        for( letter in lv ) max=Math.max(max,lv[letter].value);
        $42.letterOccurences = [];
        $42.letterOrder = [];
        for( var i=0 ; i<letters.length ; i++ ) {
            var occ = lv[letters[i]] && parseInt(1/lv[letters[i]].value*max),
                order = lv[letters[i]] && lv[letters[i]].order;
            $42.letterOccurences[i] = occ || 0; 
            if( order !== undefined ) $42.letterOrder[order] = letters[i];
        }

        // check if word file is patible
        for( var prefix in w ) {
            var words = w[prefix];

            cc.assert(words[0] && words[0].word, "42words, json loader: Prefix "+prefix+" has no words.");
            for( var j=0 ; j<words.length ; j++ ) {
                cc.assert(words[j].word.length >=4 && words[j].word.length <= $42.BOXES_PER_ROW, 
                        "42words, json loader: Word '"+words[j].word+"' has wrong length.");	
            }
        }

        if( typeof cb === "function" ) cb();
    }
});

