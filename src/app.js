//////////////////////////////////////////////////////////////////////////////////
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
    //SERVER_ADDRESS: "ws://localhost:4021/socket",
    //SERVER_ADDRESS: "ws://192.168.178.177:4021/socket",
    SERVER_ADDRESS: "ws://217.197.85.219:4021/socket",
    TITLE_MENU_COLOR_1: cc.color(44,18,44,255), // 
    TITLE_MENU_COLOR_2: cc.color(44,18,44,255), // 
    TITLE_MENU_COLOR_3: cc.color(44,18,44,255), // 
	TAG_SPRITE_MANAGER : 1,                 // Sprite Ids
	TAG_GAME_LAYER : 3,                     //
	TAG_TITLE_LAYER : 4,                    //
	TAG_SETTINGS_LAYER : 5,                 //
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
	TOUCH_THRESHOLD : 3,                    // pixel
	KEY_LEFT_CODE : 37,                     // keys for browser usage
	KEY_UP_CODE : 38,                       //
	KEY_RIGHT_CODE : 39,                    //
	KEY_DOWN_CODE : 40,                     //
    SCOREBAR_SETBACK : 3,                   // time after score shows level 0 again
    SCOREBAR_MAX_LAYER_SCROLL: 2,           // Maximum levels of score bar
	TILE_BOXES : [                          // Tetris forms
	    [{x:-1.5*64,y: 0.0*64},{x:-0.5*64,y: 0.0*64},{x: 0.5*64,y: 0.0*64},{x: 1.5*64,y: 0.0*64}],
		[{x:-0.5*64,y:-0.5*64},{x:-0.5*64,y: 0.5*64},{x: 0.5*64,y:-0.5*64},{x: 0.5*64,y: 0.5*64}],
		[{x:-1.0*64,y: 0.5*64},{x:-1.0*64,y:-0.5*64},{x: 0.0*64,y:-0.5*64},{x: 1.0*64,y:-0.5*64}],
		[{x:-1.0*64,y:-0.5*64},{x: 0.0*64,y:-0.5*64},{x: 1.0*64,y:-0.5*64},{x: 1.0*64,y: 0.5*64}],
        [{x:-1.0*64,y:-0.5*64},{x: 0.0*64,y:-0.5*64},{x: 1.0*64,y:-0.5*64},{x: 0.0*64,y: 0.5*64}],
		[{x:-1.0*64,y: 0.5*64},{x: 0.0*64,y: 0.5*64},{x: 0.0*64,y:-0.5*64},{x: 1.0*64,y:-0.5*64}],
		[{x:-1.0*64,y:-0.5*64},{x: 0.0*64,y:-0.5*64},{x: 0.0*64,y: 0.5*64},{x: 1.0*64,y: 0.5*64}],
	],
	TILE_OCCURANCES : [10,5,7,7,4,2,2], // How often the tiles appear, when selected randomly
	TILE_OCCURANCES_EASY : [10,5,7,7,1,0,0], 
    TILE_5_6_MAX_ROW : 11,
    MUSIC_VOLUME: 0.4,
    EFFECTS_VOLUME: 0.8,
    SETTINGS_HIDDEN: 0,
    SETTINGS_MOVING: 1,
    SETTINGS_SHOWN: 2,
    ENDLEVEL_HIDDEN: 3,
    ENDLEVEL_MOVING: 4,
    ENDLEVEL_SHOWN: 5,
    ENDGAME_HIDDEN: 6,
    ENDGAME_MOVING: 7,
    ENDGAME_SHOWN: 8
};
var $42 = _42_GLOBALS;
$42.webCallbacks = [];

/////////////////////////////////////////////////////////////////////////////////7
// The game layer
//
var _42GameLayer = cc.Layer.extend({
    sprite:null,
    
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
    ctor:function (mode) {
        this._super();

        var res = cc.director.getOpenGLView().getFrameSize();
        
        //$42.TOUCH_SWIPE_THRESHOLD = $42.TOUCH_THRESHOLD * cc.height / res.height;
        $42.TOUCH_SWIPE_THRESHOLD = $42.TOUCH_THRESHOLD;
        
        /////////////////////////
        // Look if there is a plugin module
        if( typeof _42_MODULE === 'function' ) _42_MODULE(this);
        $42.SCENE.mainLayer = this;

        this.showLogOnScreen();
        this.initBoxSpace();
        this.loadImages();

	    this._currentTile = null;
	    
        this._gameMode = mode;
        cc.assert(mode==="easy" || mode==="intermediate" || mode==="expert", "Game mode '"+mode+"' not supported.");

        this.setCascadeOpacityEnabled(true);

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

        if( this.hookExit ) this.hookExit();        
        $42.SCENE.mainLayer = null;
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // endGame cleans up after a game is finished
    endGame: function() {
	    //////////////////////////////////
        // Stop tiles
        this.stopListeners();
	    this.unscheduleUpdate();

        if( this.hookEndGame ) this.hookEndGame();

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

    //////////////////////////////////////////////////////////////////////////////
    // hideGame fades out the game and calls endGame after it vanished
    hideAndEndGame: function(delay) {
        var self = this;

        this.runAction(
            cc.sequence(
                cc.EaseSineOut.create(
                    cc.fadeOut(1)
                ),
                cc.delayTime((delay||1)-1),
                cc.callFunc(function() {
                    self.getParent().removeChildByTag($42.TAG_GAME_LAYER); // after this ml.onExit() is called by cocos2d-x
                    self.endGame();
                    return;
                })
            )
        );
    },

    ////////////////////////////////////////////////////////////////////////////
    // 
	showLogOnScreen: function() {
		
        // tmp Errormessage layer
        var logMsg = cc.Node.create();
        
        $42.msg1 = cc.LabelTTF.create(" ", "Arial", 20),
        $42.msg2 = cc.LabelTTF.create(" ", "Arial", 20);
        
        $42.msg1.setPosition(0,0);
        $42.msg2.setPosition(0,-20);
		logMsg.setPosition(cc.width/2,cc.height-50);

		logMsg.addChild($42.msg1, 1);        	
		logMsg.addChild($42.msg2, 1);        	
        
        _42_retain($42.msg1, "msg1");
        _42_retain($42.msg2, "msg2");
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
        sb.setCascadeOpacityEnabled(true);
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
		
		//var label = new cc.LabelBMFont( text , "res/fonts/amtype"+size+".fnt" , cc.LabelAutomaticWidth, cc.TEXT_ALIGNMENT_LEFT ),
    	var label = new cc.LabelTTF   ( text , _42_getFontName(res.exo_regular_ttf), size),
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
				wordFrameSprite = new cc.Sprite(wordFrameFrame),
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
				sprite = new cc.Sprite(spriteFrame,cc.rect(0,0,$42.BS,$42.BS));
			//if( !sprite ) cc.log("File '"+file+".png' couldn't be opened. Letter: "+word[i]);
            sprite.setPosition($42.BS/2+i*$42.BS+$42.WORD_FRAME_WIDTH,$42.BS/2+$42.WORD_FRAME_WIDTH);
            //  ERROR: JS: assets/src/app.js:370:TypeError: sprite is null
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
	            		var loc = pos;
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
	            		var loc = pos;
	            	}
	                
	            	var start = self.touchStartPoint,
                        last = self.touchLastPoint;
	
	                if( !loc || !start ) {
                        cc.assert(false, "There should always be a location and a start point while moving.");
		                self.isSwipeUp = self.isSwipeLeft = self.isSwipeRight = self.isSwipeDown = false;	                			                
	                	return;
	                }
	                
	                self.touchCurrentMove = {
                        x: (self.touchCurrentMove && self.touchCurrentMove.x || 0) + loc.x - last.x,
                        y: (self.touchCurrentMove && self.touchCurrentMove.y || 0) + loc.y - last.y
	            	};
                    //cc.log("self.touchCurrentMove: "+JSON.stringify(self.touchCurrentMove)+", loc: "+JSON.stringify(loc)+", last: "+JSON.stringify(last));
	                
	                // check for left
	                if( loc.x < start.x - $42.TOUCH_SWIPE_THRESHOLD) {
                        self.isSwipeLeft = true;                		
	                }
	                
	                // check for right
	                if( loc.x > start.x + $42.TOUCH_SWIPE_THRESHOLD ) {
	                    	self.isSwipeRight = true;                		
	                }
	
	                // check for down
	                if( loc.y < start.y - $42.TOUCH_SWIPE_THRESHOLD * 3 ) {
                        self.isSwipeDown = true;                		
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
	
	            	if( !pos || !pos.x === undefined ) {
		            	var touch = touches[0],
		            		loc = touch.getLocation();	            		
	            	} else {
	            		var loc = pos;
	            	}
	                
	                self.touchStartPoint = null;
	                
	                if(!self.isSwipeUp && !self.isSwipeLeft && !self.isSwipeRight && !self.isSwipeDown) {
	                	if( new Date().getTime() - self.touchStartTime > $42.LONG_TAP_TIME ) {
	    	                if( self.hookOnLongTap ) self.hookOnLongTap(loc);
	                	} else {
		                	self.isTap = true;
		                	if( self.hookOnTap(loc) ) {

								if( loc.y < $42.BOXES_Y_OFFSET ) {
									self.moveRollingLayer(undefined,3);
								} else {
									self.isSwipeUp = true;
								}
							}
	                	}
	                } else {
		                self.isSwipeUp = self.isSwipeLeft = self.isSwipeRight = self.isSwipeDown = false;	                			                
	                }
                    
                    self.touchCurrentMove = {x:0, y:0};
	            }
	        });
		    	
	    	cc.eventManager.addListener(this._touchListener, this);
	    } 

		/*
		 * KEYBOARD EVENTS
		 */ 
       	
	    if( 'keyboard' in cc.sys.capabilities ) {
	        this._keyboardListener = cc.EventListener.create({
	            event: cc.EventListener.KEYBOARD,
	            onKeyPressed:function(key, event) {
	            	var tile = self._currentTile,
	            		sprite = tile && tile.sprite;
	            	if( !sprite ) return;
	            	var pos = sprite.getPosition();
	            	switch(key) {
	            	case 'a':
	            	case $42.KEY_LEFT_CODE:
	            		self.touchCurrentMove = { 
	            			x: -$42.BS,
	            			y: 0,
                            on: true
	            		};
                        if( !self.isSwipeLeft && self.hookPlayLevelSound ) {
                            if( self.hookFuncOnNextBeat ) {
                                self.hookFuncOnNextBeat(function() {
                                    if( self.hookPlayLevelSound ) self.hookPlayLevelSound("swipe");
                                },"swipe");
                            }
                        }
                        self._currentTile.isDragged = true;
	            		self.isSwipeLeft = true;
	            		break;
	            	case 's':
	            	case $42.KEY_RIGHT_CODE:
	            		self.touchCurrentMove = { 
	            			x: $42.BS,
	            			y: 0,
                            on: true
	            		};
                        if( !self.isSwipeRight && self.hookPlayLevelSound )  {
                            if( self.hookFuncOnNextBeat ) {
                                self.hookFuncOnNextBeat(function() {
                                    if( self.hookPlayLevelSound ) self.hookPlayLevelSound("swipe");
                                },"swipe");
                            }
                        }
                        self._currentTile.isDragged = true;
	            		self.isSwipeRight = true;
	            		break;
	            	case $42.KEY_UP_CODE:
	            		self.isSwipeUp = true;
	            		break;
	            	case $42.KEY_DOWN_CODE:
	            		self.touchCurrentMove = { 
	            			x: 0,
	            			y: -$42.BS,
                            on: true
	            		};
                        //cc.log("DOWN: self._currentTile.isDragged = "+self._currentTile.isDragged+", self.isSwipeDown = "+self.isSwipeDown);
                        if( !self.isSwipeDown && self.hookPlayLevelSound ) {
                            if( self.hookFuncOnNextBeat ) {
                                self.hookFuncOnNextBeat(function() {
                                    if( self.hookPlayLevelSound ) self.hookPlayLevelSound("swipe");
                                },"swipe");
                            }
                        }
                        self._currentTile.isDragged = true;
	            		self.isSwipeDown = true;
	            		break;
                    case 6:
                    case 27:
                        var sl = $42._settingsLayer;

                        if( !sl._settingsShown || sl._settingsShown === $42.SETTINGS_HIDDEN || sl._settingsShown === $42.ENDLEVEL_HIDDEN || sl._settingsShown === $42.ENDGAME_HIDDEN || sl._settingsShown === $42.ENDTWEET_HIDDEN ) {
                            sl._settingsShown = $42.ENDLEVEL_MOVING;
                            self.stopListeners();
                            self.unscheduleUpdate();

                            var menuItems = [];
                            
                            menuItems.push(
                                new cc.MenuItemFont($42.t.want_to_end_game, function(sender) {
                                    if( self.hookStopBackgroundMusic ) self.hookStopBackgroundMusic();                       
                                    self.hideAndEndGame();
                                    $42._settingsLayer.hideSettings(function() {});
                                    $42._titleLayer.show();
                                    sl._settingsShown = $42.ENDLEVEL_HIDDEN;
                                }, self)
                            );

                            menuItems.push(
                                new cc.MenuItemFont($42.t.want_to_continue, function(sender) {
                                    $42._settingsLayer.hideSettings(function() {
                                        self.resume();
                                        self.scheduleUpdate();
                                        self.initListeners();
                                        sl._settingsShown = $42.ENDLEVEL_HIDDEN;
                                    });
                                }, self)
                            );

                            menuItems[0].setFontSize(48);        	
                            menuItems[1].setFontSize(48);  

                            $42._settingsLayer.showEndLevel(menuItems, function() {
                                sl._settingsShown = $42.ENDLEVEL_SHOWN;
                            });
                        } else if( self._settingsShown === $42.ENDLEVEL_SHOWN ) {
                            self._settingsShown = $42.ENDLEVEL_MOVING;
                            $42._settingsLayer.hideSettings(function() {
                                self._settingsShown = $42.ENDLEVEL_HIDDEN;
                            });
                        }
                        break;
                    default:
                        cc.log("key: "+key);
                        if( self.hookKeyPressed ) self.hookKeyPressed(key);
	            	}
	            },
	            onKeyReleased:function(key, event) {
	            	switch(key) {
	            	case $42.KEY_LEFT_CODE:
	            		self.touchCurrentMove.on = false; 
	            		self.isSwipeLeft = false;
	            		break;
	            	case $42.KEY_RIGHT_CODE:
	            		self.touchCurrentMove.on = false; 
	            		self.isSwipeRight = false;
	            		break;
	            	case $42.KEY_UP_CODE:
	            		self.isSwipeUp = false;
	            		break;
	            	case $42.KEY_DOWN_CODE:
	            		self.touchCurrentMove.on = false; 
	            		self.isSwipeDown = false;
	            		break;
	                }
	            }
	        }, this);
	        cc.eventManager.addListener(this._keyboardListener, this);
	    } else {
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
			newTile = this.hookSetTile? this.hookSetTile() : this.getRandomValue($42.TILE_OCCURANCES),
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
			var tileSprite = new cc.Sprite(res.tiles_png,cc.rect(0,0,0,0));
			
			_42_retain(tileSprite, "buildTile: tileSprite");
	        tileSprite.setPosition(p);
	        self.addChild(tileSprite);

	        // add single boxes with letters to the tile
	        for( var i=0 ; i<tileBoxes.length ; i++) {
	        	
	    		spriteFrame = cc.spriteFrameCache.getSpriteFrame(newTile+".png"),
	    		sprite = new cc.Sprite(spriteFrame,cc.rect(0,0,$42.BS,$42.BS));

	    		_42_retain(sprite, "builTile: sprite "+i);
	        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
	        	sprite.setRotation(-$42.INITIAL_TILE_ROTATION);
		        tileSprite.addChild(sprite);
	        }			
		}
        
        tileSprite.setCascadeOpacityEnabled(true);

        //////////////////////////
        // build a tile object
        var t = {
        	boxes: tileBoxes,
        	sprite: tileSprite,
        	rotation: $42.INITIAL_TILE_ROTATION,
        	direction: 0,  // 0: not moving, -1: left, 1: right 
        	isRotating : false,
        	action: null,
        	fallingSpeed: $42.FALLING_SPEED,
        	userData: userData
        };
        
        tileSprite.setRotation($42.INITIAL_TILE_ROTATION);
		rt = this.rotateBoxes(t);
		
		// play sound
		//cc.audioEngine.playEffect(res.plopp_mp3);

        return t;
	},
	
    ///////////////////////////////////////////////////////////////////
    // getRandomValue returns a weighted random number
    //
	getRandomValue: function(occs, sum, max) {
		
		if( !sum ) for( var i=0, sum=0 ; i<(max || occs.length) ; i++ ) sum += occs[i];
		
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
    	
    	var self = this;

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
    	var checkForBottom = function(t, lp, cb) {
    		var b = t.rotatedBoxes; // usually four boxes of a tile
    		
            /////////////////////
    		// check all boxes individually
    		for( var i=0 ; i<b.length ; i++ ) {
    			var bx = lp.x + b[i].x,		// x pos of box
    				by = lp.y + b[i].y,		// y pos of box
    				brc1 = getRowCol(b[i], { x: lp.x + $42.BS/2 - 3, y: lp.y}), 
    				brc2 = getRowCol(b[i], { x: lp.x - $42.BS/2 + 3, y: lp.y}); 
                
                //cc.log("Looking for bottom at columns "+JSON.stringify(brc1)+" and "+JSON.stringify(brc2));
    			if( by - $42.BS/2 <= $42.BOXES_Y_OFFSET ||    // bottom reached? 
    				(brc1.row < $42.BOXES_PER_COL && (self.boxes[brc1.row][brc1.col] || self.boxes[brc2.row][brc2.col])) ) { // is there a fixed box under the moving box?

    				// align y to box border
                    //cc.log("checkForBottom --- brc1.col: "+brc1.col+", brc2.col: "+brc2.col);
    				lp.y = Math.round((lp.y - $42.BOXES_Y_OFFSET)/($42.BS/2))*($42.BS/2) + $42.BOXES_Y_OFFSET;
    				
    				// fix tile
    				if( !t.isDragged && !t.isRotating ) {
                        self.tileIsFixing = true;
                        if( self.hookFuncOnNextBeat ) {
                            self.hookFuncOnNextBeat(function() {
                                var time = new Date().getTime();
                                //cc.log("---Fixing tile music--- Fixing tile at "+time);
                                cb(fixTile(t, lp));
                                self.tileIsFixing = false;
                            },"fixTile");
                        } else { 
                            cb(fixTile(t, lp));
                            self.tileIsFixing = false;
                        }

                        return true;
                    }
    			}
    		}

    		return false;
    	};
    	
        //////////////////////////////////////
        // Internal function: Move tile left or right
    	var moveHorizontalyAndCheckForBarrier = function(t, lp, cm) {
    		var b = t.rotatedBoxes,					// usually four tile boxes
    			offset = 32-(Math.abs(t.rotatedBoxes[0].x) % $42.BS),
    			dir = Math.sign(cm.x);  	// direction, left = -1
    		
			// limit horizontal movement to little less than one box per cycle
			lp.x += Math.min( Math.abs(cm.x) , $42.BS-1 )*Math.sign(cm.x);
			
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
        				//cc.log("_42, moveHorizontalyAndCheckForBarrier: Correcting box! brc1: "+JSON.stringify(brc1)+
                        //                                                             ", brc2: "+JSON.stringify(brc2));
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
    		}
    		
    		return true;
    	};
    	
        //////////////////////////////////////
        // Internal function: Align tile gently to a column 
		var alignToColumn = function(t, lp, doneFn) {
			var tileOffset = $42.BS/2 - Math.abs(t.rotatedBoxes[0].x%$42.BS),
				offset = (lp.x-$42.BOXES_X_OFFSET-tileOffset)%$42.BS;
			
            offset = offset < $42.BS/2? -offset : $42.BS - offset;    
			//offset = offset < $42.BS/2? offset : offset - $42.BS;
			
			if( t.isRotating && !(t.rotation%180) && checkRotation( t , {x:lp.x - offset , y:lp.y} ) === "ok" ) offset = -offset;
		
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
    	var rotateTile = function rotate(t, lp, recurse) {
			var oldRotation = t.rotation;
			t.rotation = (t.rotation + 90)%360;
			self.rotateBoxes(t);
	
			// shift Tile if it needs to be align to column after rotation
			var ret = checkRotation(t, lp);
			
			if( ret !== "collision" ) {
				// shift tile, if it would not fit into playground after rotation
				var shiftTile = -(parseInt(ret.offset) || 0);
				
				if(shiftTile != 0) {
					var targetX = lp.x + shiftTile;
					t.direction = Math.sign(shiftTile);
					if( t.direction ) {
						t.isAligning = true;
						t.sprite.runAction(
                            cc.sequence( 
								cc.moveBy($42.MOVE_SPEED*2,cc.p(shiftTile,0)),
								cc.callFunc(function() {
					    			var lp = t.sprite.getPosition();
					    			t.sprite.setPosition(targetX, lp.y);
					    			t.direction = 0;
									t.isAligning = false;
								}, self)
						    )
                        );						
					}
				} else {
					alignToColumn(t, lp);
				}
				
				// play sound
                if( self.hookFuncOnNextBeat ) {
                    self.hookFuncOnNextBeat(function() {
                        if( self.hookPlayLevelSound ) self.hookPlayLevelSound("rotate");
                    },"rotate");
                }

				t.sprite.runAction(cc.sequence( 
						cc.rotateTo($42.MOVE_SPEED*2,t.rotation),
						cc.callFunc(function() {
							t.isRotating = false;
						})));
				for( var i=0 ; i<t.sprite.children.length ; i++ ) {
					t.sprite.children[i].runAction(cc.rotateTo($42.MOVE_SPEED*2,(360-t.rotation)%360));					
				}	
					       		
				
				return true;
			} else if( !recurse ) { 
                t.rotation = oldRotation;
                self.rotateBoxes(t);  
                if( rotate(t, {x: lp.x, y: lp.y+$42.BS}, true) ) {
                    lp.y += $42.BS;
                    return true;
                } 
            }

            t.isRotating = false;
            t.rotation = oldRotation;
            self.rotateBoxes(t);  
            
            return false;
    	};
    	
        /////////////////////////////
        // Internal function: Look if rotation is possible, 
    	var checkRotation = function(t, lp, evade) {
    		
    		var b = t.rotatedBoxes,
    			minOffset = 0,
    			maxOffset = 0,
                rotationBottom = 0;
    		
    		// check if tile could be in the new position
    		for( var i=0 ; i<b.length ; i++) {
        		var brc = getRowCol(b[i], lp);
        		
        		// record left and right extremes
        		minOffset = Math.min(minOffset, lp.x + b[i].x - $42.BOXES_X_OFFSET - $42.BS/2);
        		maxOffset = Math.max(maxOffset, lp.x + b[i].x - $42.BOXES_X_OFFSET + $42.BS/2);
        		
        		// check if other tiles are at new tile position
        		if( brc.row < 0 || self.boxes[brc.row][brc.col] ) {
        			var ret,move;
        			if( !evade && 
        				((move = -$42.BS/2, ret = checkRotation( t , {x:lp.x + move , y:lp.y}  , true )) !== "collision" || 
        				 (move =  $42.BS/2, ret = checkRotation( t , {x:lp.x + move , y:lp.y}  , true )) !== "collision") )
        				 return {
                            offset: (ret==="ok"?0:ret.offset)-move,
                            rotationBottom: ret.rotationBottom
                        };
        			
        			else return "collision";
        		}

                if( brc.row < 1 || self.boxes[brc.row-1][brc.col] ) {
                    rotationBottom = brc.row * $42.BS - b[i].y + $42.BOXES_Y_OFFSET + $42.BS/2;
                }
    		}
    		
    		if( minOffset < 0 || maxOffset > $42.BOXES_PER_ROW * $42.BS ) {
    			var offset = minOffset? minOffset : maxOffset - $42.BOXES_PER_ROW * $42.BS,
    				newLp = {
    					x: lp.x - offset,
    					y: lp.y
        			};
    				
    			if( checkRotation(t , newLp , true ) === "ok" ) return {
                    offset: offset,
                    rotationBottom: rotationBottom
                };
    			else return "collision";
    		} 
    			
    		return !rotationBottom? "ok": {
                offset: 0,
                rotationBottom: rotationBottom
            };
    	};
    	
    	//////////////////////////////////
    	// Internal function: fix tile to the ground
    	var fixTile = function fixTileFn(t, lp) {
    		var b = t.rotatedBoxes,
    			newBrcs = [],
    			ret = "ok";
    		
            //cc.log("Fixing tile at "+JSON.stringify(lp));
    		// check if a tile is too high
    		for( var i=0,minRow ; i<b.length ; i++ ) {
				var brc = getRowCol(b[i], lp);

                minRow = Math.min(minRow || brc.row, brc.row);

                if( brc.row < 0 || self.boxes[brc.row][brc.col] ) {
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
                    //cc.log("fixTile: Problem fixing tile at pos "+JSON.stringify(lp)+" at brc "+JSON.stringify(brc)+" with "+JSON.stringify(boxesMod));
                }
            }

            if( minRow >= $42.GAME_OVER_ROW ) ret = "gameover";
    		

    		// fix single boxes of tile
    		if( ret !== "gameover" ) {
                //cc.log("minRow = "+minRow);
        		for( var i=0 ; i<b.length ; i++) {
            		// create a new sprite from the old child sprite
        			var sprite = t.sprite.children[i],
        				newSprite = new cc.Sprite(sprite.getSpriteFrame(), cc.rect(0,0,$42.BS,$42.BS));

        			_42_retain(newSprite, "box sprite"+i);
        			
        			// Insert into boxes array
    				var brc = getRowCol(b[i], lp);
    				newBrcs.push(brc);
        			
        			newSprite.setPosition($42.BOXES_X_OFFSET + brc.col*$42.BS + $42.BS/2 , $42.BOXES_Y_OFFSET + brc.row*$42.BS + $42.BS/2);
        	        self.addChild(newSprite,5);

            		self.boxes[brc.row][brc.col] = {
            			sprite: newSprite,
            			userData: t.userData && typeof t.userData === "object" && t.userData[i] || t.userData
            		};     					
        		}    			

    	        //$42.msg1.setString($42.msg2.getString());
    	        //$42.msg2.setString("userData: "+JSON.stringify(t.userData)+", brcs: "+JSON.stringify(newBrcs));
    		} else {
                //cc.log("GAME OVER! Row = "+minRow);
            }
    		
    		var tileRet = false;
    		if( self.hookTileFixed ) {
                try {
                    tileRet = self.hookTileFixed(newBrcs);
                } catch(e) {
                    cc.log("ERROR!"+e.message+"hookTileFixed problem with newBrcs "+JSON.stringify(newBrcs)+" at position "+JSON.stringify(lp));
                }
            } else {
                self.pauseBuildingTiles = false;
            }

    		if( !tileRet ) {
                try {
    			    self.checkForAndRemoveCompleteRows();
                } catch(e) {
                    cc.log("ERROR!"+e.message+" checkForAndRemoveCompleteRows problem with newBrcs "+JSON.stringify(newBrcs)+" at position "+JSON.stringify(lp));
                }
        		if( self.hookTileFixedAfterRowsDeleted ) {
                    try {
                        self.hookTileFixedAfterRowsDeleted();
                    } catch(e) {
                        cc.log("ERROR!"+e.message+" hookTileFixedAfterRowsDeleted problem with newBrcs "+JSON.stringify(newBrcs)+" at position "+JSON.stringify(lp));
                    }
                }
    		}

    		self.removeChild(t.sprite);
       		
    		return ret;
    	};
    
        /////////////////////////////////////////
        // Layer function: Check if a row is complete and remove it     
    	self.checkForAndRemoveCompleteRows = function(rowToDelete) {
    	    
            if( rowToDelete instanceof Array ) {
                for( var i=0 ; i<rowToDelete.length ; i++ ) self.deleteRow(rowToDelete[i],true);
                var rowsDeleted = rowToDelete;
            } else {
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
            }
    		
    		// move rows above deleted rows down
    		if( rowsDeleted.length ) {

    			var colsToCorrect = [],
    				prevColBlocked, curColBlocked;
    			
    			colsToCorrect[0] = false;

                var colsBlocked = [];
    			for( var i=0 ; i<$42.BOXES_PER_ROW ; i++ ) {
    				var rd = [];
    				for( var j=0 ; j<rowsDeleted.length ; j++) {
    					
        				// don't delete a box when it wasn't actually deleted (though it's row was)  
    					if( self.boxes[rowsDeleted[j]][i] === null ) {
    						rd.push(rowsDeleted[j]);
    					}
    				}
    				
    				// mark transitions between blocked and non blocked columns for detection of single boxes later
    				curColBlocked = rowsDeleted.length != rd.length;
                    colsBlocked.push(curColBlocked);
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

                //cc.log("checkForAndRemoveCompleteRows, colsBlocked: "+JSON.stringify(colsBlocked));
                //cc.log("checkForAndRemoveCompleteRows, colsToCorrect: "+JSON.stringify(colsToCorrect));

    			// move single boxes down 
    			for( var i=0 ; i<$42.BOXES_PER_ROW ; i++ ) {
    				if( colsToCorrect[i] ) {
    					for( var j=rowsDeleted[0] ; j < $42.BOXES_PER_COL ; j++ ) {
    						// check if box have no neighbors left
    						if( self.boxes[j][i] && 
                                !colsBlocked[j] &&
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
    							
    							//cc.log("42Words, checkForAndRemoveCompleteRows: Move box from ("+i+","+j+") to ("+i+","+k+")");
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
            var tmpBoxes = [];
        	for( var i=0 ; i<$42.BOXES_PER_ROW ; i++ ) {
		    	if( deleteAnyway || !self.hookDeleteBox || self.hookDeleteBox({row:row,col:i}) ) {
		    		
                    var tmpBox = {}; tmpBoxes.push(tmpBox);
	        		// destroy sprite and box  
		    		if( self.boxes[row][i] ) {
                        tmpBox.userData = self.boxes[row][i].userData;
		    			_42_release(self.boxes[row][i].sprite);
	    			
                        var sprite = self.boxes[row][i].sprite;  
                        sprite.setOpacity(0);  
		            	self.boxes[row][i].sprite = null;
				    	self.boxes[row][i] = null;		
				    	
			            // particle emitter
			            var emitter = new cc.ParticleSystem( res.particle_flowers );
			            emitter.x = $42.BS/2;
			            emitter.y = $42.BS/2;
			            emitter.setAngle(Math.random()*360);
			            sprite.addChild(emitter);
 
			            emitter.runAction(
			            	cc.sequence(
			            		cc.delayTime(2 + Math.random()*0.25),
			            		cc.callFunc(function() {
			            			self.removeChild(this);
			            		},sprite)
			            	)
			            );
		    		}
		    	}
    		}           	
    	
            //cc.log("deleteRow, rows deleted: "+JSON.stringify(tmpBoxes));
        };

        /////////////////////////////
        // Internal function: 
        var isSwipe = function() {
        	return self.isSwipeLeft || self.isSwipeRight || self.isSwipeUp || self.isSwipeDown;
        }

        ///////////////////////////////////////////////////////
    	// Actual update functionality starts here ... beginning by calling hook update function
    	if( self.hookUpdate ) self.hookUpdate(dt);
    	
    	/////////////////////////////////////
    	// Main loop to move tiles (function is built to be able to move more than one tile at once, but it is not used)
        var t = this._currentTile;
        
        /////////////////////////////////////
    	// if there is no tile flying right now, build a new one
        if( !t && !this.pauseBuildingTiles ) {
            var buildTile = function() {
                self._currentTile = t = self.buildTile(cc.p(Math.random()*($42.BOXES_PER_ROW-4)*$42.BS+$42.BOXES_X_OFFSET+2*$42.BS, cc.height+$42.BS)); 
                this.pauseBuildingTiles = false;
            };

            this.pauseBuildingTiles = true;
            if( self.hookFuncOnNextBeat ) {
                self.hookFuncOnNextBeat(function() {
                    buildTile();
                },"setTile");
            } else buildTile();
        }
        
        if( !t || self.tileIsFixing ) return;
        
        var lp = t.sprite.getPosition(),
            sp = self.touchStartPoint,
            tp = self.touchLastPoint,
            cm = self.touchCurrentMove || {x:0, y:0};

        lp.x = Math.round(lp.x); // align x (positions manipulated by MoveBy seem to be not precise)

        ////////////////////////////////////////
        // Move tile left and right
        if( !t.isDragged && !t.isAligning ) {

            if( !t.isRotating ) {
                /////////////////////////////////////
                // swipe up rotates a tile
                if( self.isSwipeUp ) {
                    
                    self.isSwipeUp = false;
                    t.isRotating = true;
                    t.fallingSpeed = $42.FALLING_SPEED;
                    
                    rotateTile(t , lp);
                }			
            }
            
            if( !t.isRotating && isSwipe() && sp ) {
                t.isDragged = true;
                //cc.log("Switch on dragging");
                if( self.hookFuncOnNextBeat ) {
                    self.hookFuncOnNextBeat(function() {
                        if( self.hookPlayLevelSound ) self.hookPlayLevelSound("swipe");
                    },"swipe");
                }
            } 
            
            if( !self.isSwipeDown ) {
                ////////////////////////////////////////
                // go back to normal falling speed if tile is not dragged
                if( lp.y < cc.height + $42.BS ) {
                    t.fallingSpeed = Math.max( t.fallingSpeed *0.93 , $42.FALLING_SPEED );
                } else {
                    // Let tile fall faster at top border
                    t.fallingSpeed = $42.FALLING_SPEED * 36;
                }
            }

        } else {

            if( !sp && !cm.on ) {
                /////////////////////
                // align to column if player does't touch the tile
                if( !t.isAligning ) {
                    
                    alignToColumn(t,lp,function() {
                        t.isDragged = false;    					
                        //cc.log("Switch of dragging ...");
    		            if( self.hookStopLevelSound ) self.hookStopLevelSound("swipe");
                    });	
                }
            } else {
                ///////////////////////
                // Move tile if she touches it
                if( !t.isAligning ) {
                    moveHorizontalyAndCheckForBarrier(t,lp,cm);   
                    cm.x = 0;
                }
                
                if(cm.y < 0 && !t.isRotating) {
                    t.fallingSpeed = Math.min( -cm.y , $42.FALLING_SPEED * 32);
                    cm.y += t.fallingSpeed;
                    if( cm.y > 0 ) cm.y = 0;
                } else {
                    t.fallingSpeed = $42.FALLING_SPEED;
                }
            }
        }
        
        //////////////////////////////
        // let tile fall down
        lp.y -= t.fallingSpeed;
        
        //////////////////////////////
        // Check for bottom
        var ret;
        self.pauseBuildingTiles = true;
        if( !checkForBottom(t, lp, function(ret) {
            //////////////////////////////////////////
            // tile landed, release and delete it ...
            var t = self._currentTile.sprite,
                ch = t.getChildren();
            _42_release(t);
            for(var i=0 ; i<ch.length; i++) _42_release(ch[i]);
            self._currentTile = null;

            //////////////////////////////////
            // Check for game over (preliminary, still can be revoked)
            if( ret == "gameover" ) {

                var menuItems = [];
                if( !self.lastGameOverTime || self.lastGameOverTime < new Date().getTime() - 1000 ) {
                    
                    ///////////////////////
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
                        if( self.hookStopBackgroundMusic ) self.hookStopBackgroundMusic();                       
                        self.hideAndEndGame();
                        this.exitMenu();
                        this.getParent().removeChild(this);
                        $42._titleLayer.show();
                    }
                });
                
                self.getParent().addChild(
                    new _42MenuLayer("",menuItems),
                    2);
                self.pause();
                self.unscheduleUpdate();
            }
            
        })) {
            t.sprite.setPosition(lp);    			
        } else {
            if( self._currentTile ) t.sprite.setPosition(lp);
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
    	var self = this;            
        
        this._super(new cc.Color(40,0,0,160),cc.width,cc.height);

        this.initMenu(question, menuItems);
		
        return true;
    },

    //////////////////////////////////////
    // initMenu init the actual menu
    //
	initMenu: function(questions, menuItems) {
		
        var self = this,
        	items = [];

        ////////////////////
        // Show question
        if( typeof questions === "string") questions = [questions];
        for( var i=0 ; i<questions.length ; i++ ) {
    		var q = cc.LabelTTF.create(questions[i], _42_getFontName(res.exo_regular_ttf), 36),
	    	x = cc.width/2,
	    	y = cc.height/2 + menuItems.length * 96 + (questions.length-i-1) * 64;
	
			q.setPosition(x,y);
			this.addChild(q, 1);        	
        }
        
        ////////////////////
        // Show menu items
        for( var i=0 ; i<menuItems.length ; i++ ) {
            items[i] = new cc.MenuItemFont(menuItems[i].label, menuItems[i].cb, this);
            items[i].setFontSize(72);        	
        }

        /////////////////////
        // Create menu
        var menu = this._menu = cc.Menu.create.apply(this, items);
        menu.x = cc.width/2;
        menu.y = cc.height/2;
        this.addChild(menu, 1, $42.TAG_MENU_MENU);       

        menu.alignItemsVerticallyWithPadding(40);
	},

    getMenu: function() { return this._menu; },
    
    exitMenu: function() {
    	
    }
});

//////////////////////////////////////////////////////////////////////////////////
// The Title layer of the game
//
var _42TitleLayer = cc.Layer.extend({
    
    ctor:function () {
        this._super();

        var self = this;

        cc.width  = cc.director.getWinSize().width;
        cc.height = cc.director.getWinSize().height;

		cc.spriteFrameCache.addSpriteFrames(res.letters_plist);
		cc.spriteFrameCache.addSpriteFrames(res.circles_plist);
		
        var titleBg = this._titleBg = new cc.Sprite(res.title_easy_png);
        titleBg.setOpacity(0);
        titleBg.setPosition(cc.p(cc.width/2, cc.height/2));
        titleBg.setScale(1.1);
        _42_retain(this._titleBg,"Title background");

        // Show menu items
		var addMenu = function(name, fontSize, color, cb) {
	        var item = new cc.MenuItemFont(name, cb, self);
	        item.setFontName(_42_getFontName(res.exo_regular_ttf));        	
	        item.setFontSize(fontSize);  
	        item.setColor(color);
	        
	        return item;
		};
	
        this._gameStarted = false;
        var ls = cc.sys.localStorage;
        
        $42.tutorialsDone = JSON.parse(ls.getItem("tutorialsDone") || "{}");

        var item1 = $42.menuItemStart = addMenu("no label", 60 , $42.TITLE_MENU_COLOR_1 ,  function() {
                self._menu.setEnabled(false);
                // start game layer
                var cDiff = ls.getItem("currentDifficulty") || "easy"; 
                self.getParent().addChild(new _42GameLayer(cDiff), 1, $42.TAG_GAME_LAYER);
                self.hide();
            }),
            item2 = $42.menuItemChange1 = addMenu("no label", 36 , $42.TITLE_MENU_COLOR_2 , function() {
                self._menu.setEnabled(false);
                $42.currentLevel = 1;
                ls.setItem("currentLevel",1);

                var cDiff = ls.getItem("currentDifficulty");
                cc.assert(cDiff, "currentDifficulty must be set when we reach this point.")
                if( cDiff === "easy" ) cDiff = "intermediate";
                else cDiff = "easy";
                ls.setItem("currentDifficulty", cDiff);
                
                self.hide(function() { self.show() });

                ls.removeItem("wordTreasure");
                ls.removeItem("wordProfile");
            }),
            item3 = $42.menuItemChange2 = addMenu("no label", 36 , $42.TITLE_MENU_COLOR_2 , function() {
                self._menu.setEnabled(false);
                $42.currentLevel = 1;
                ls.setItem("currentLevel",1);
                
                var cDiff = ls.getItem("currentDifficulty");
                cc.assert(cDiff, "currentDifficulty must be set when we reach this point.")
                if( cDiff === "expert" ) cDiff = "intermediate";
                else cDiff = "expert";
                ls.setItem("currentDifficulty", cDiff);

                self.hide(function() { self.show() });

                ls.removeItem("wordTreasure");
                ls.removeItem("wordProfile");
            }),
            item4 = addMenu($42.t.title_tweet, 28, $42.TITLE_MENU_COLOR_3 , function() {
                var tt = ls.getItem("tweetTreasure");
                if( tt ) {
                    this._menu.setEnabled(false);
                    $42._titleLayer.hide();
                    $42.tweetTreasure = JSON.parse(tt);
                    $42.SCENE.hookTweet(function() {
                        $42._titleLayer.show();
                    });
                }
            });

        var menu = this._menu = cc.Menu.create.apply(this, [item1, item2, item3, item4] );
        menu.setPosition(cc.p(cc.width/2, 230));
        menu.setOpacity(0);
        menu.alignItemsVerticallyWithPadding(20);
        _42_retain(this._menu,"Title menu");

        item4.setPosition(cc.p(200,-130));
        item4.setRotation(23);
        item4.setOpacity(0);
        
        $42.menuItemTweet = item4;
        _42_retain(item4, "Menu Item Tweet");

        this.show();

        return true;
    },

    onExit: function() {
        _42_release(this._titleBg);
        _42_release(this._menu);
        _42_release($42.menuItemTweet);
    },

    show: function() {

        var self = this,
            ls = cc.sys.localStorage,
            td = $42.tutorialsDone,
            cDiff = ls.getItem("currentDifficulty") || "easy", 
            //mDiff = ls.getItem("maxDifficulty") || "easy",
            mDiff = "expert",
            cl = $42.currentLevel = ls.getItem("currentLevel") || 1,
            tt = ls.getItem("tweetTreasure");

        ls.setItem("currentDifficulty",cDiff);

        this.addChild(this._titleBg);
        this._titleBg.setTexture(res["title_"+cDiff+"_png"]);
        this.addChild(this._menu);
        if( cDiff === "easy" ) this.backgroundMusic = $42.MUSIC_TITLE_EASY;
        else if( cDiff === "intermediate" ) this.backgroundMusic = $42.MUSIC_TITLE_INTERMEDIATE;
        else if( cDiff === "expert" ) this.backgroundMusic = $42.MUSIC_TITLE_EXPERT;

        $42.SCENE.playBackgroundMusic(this.backgroundMusic);
        
        this._menu.runAction(
            cc.EaseSineIn.create(
                cc.fadeIn(2.5)
            )
        );

        this._titleBg.runAction(
            cc.EaseSineIn.create(
                cc.fadeIn(2)
            )
        );

        $42.menuItemStart.setString(cl==1?$42.t.title_start:$42.t.title_resume);
        $42.menuItemChange1.setString(cDiff==="easy"?$42.t.title_intermediate:$42.t.title_easy);
        $42.menuItemChange1.setOpacity(mDiff==="easy"?0:255);
        $42.menuItemChange2.setString(cDiff==="expert"?$42.t.title_intermediate:$42.t.title_expert);
        $42.menuItemChange2.setOpacity(mDiff==="easy"||mDiff==="intermediate"?0:255);

        if( tt ) $42.menuItemTweet.setOpacity(255);
        else $42.menuItemTweet.setOpacity(0);
       
        this._menu.setEnabled(true);
        
        this._timeout = setTimeout(function() {
            self._timeout = null;
            if( !td.mostafasGreeting && self._menu.isEnabled() ) {
                td.mostafasGreeting = true;
                ls.setItem("tutorialsDone", JSON.stringify(td));

                $42.SCENE.hookStartAnimation("Mostafas Greeting", {
                    time: 3,
                    cb: function() {
                        // ...
                    }
                });
            }
        }, 5000); 
    },

    hide: function(cb) {

        var self = this;
        this._titleBg.runAction(
            cc.sequence(
                cc.fadeOut(1.3),
                cc.callFunc(function() {
                    self.removeChild(self._menu);
                    self.removeChild(self._titleBg);
                    if( typeof cb === "function" ) cb();
                })
            )
        );
        this._menu.runAction(
            cc.fadeOut(1.2)
        );
        
        if( this._timeout ) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }

        $42.SCENE.hookStartAnimation("Mostafa flies away", {
            time: 2,
            cb: function() {
                // ...
            }
        });

        if( this.backgroundMusic ) {
            setTimeout(function() {
                $42.SCENE.stopBackgroundMusic(self.backgroundMusic.fadeOutTimeEnd);
                this.backgroundMusic = null; 
            }, this.backgroundMusic.fadeOutDelay || 0);
        }
        
        this._menu.setEnabled(false);
    },
    
    exitTitle: function() {
    	
    	// release title graphics
 		var node = this.getChildByTag($42.TAG_TITLE_BACKGROUND);
		if( node ) _42_release(node);
		
		node = node.getChildren()[0];
		if( node ) _42_release(node);

		var nodes = node.getChildren();
		for( var i=0 ; i<nodes.length ; i++ ) {
			if( nodes[i] ) _42_release(nodes[i]);
		}    
    },
});


//////////////////////////////////////////////////////////////////////////////////
// The Settings layer of the game
//
var _42SettingsLayer = cc.Layer.extend({
    
    ctor:function () {
        this._super();

        var self = this;

        this.storyBackground = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("story_background.png"));
        _42_retain(this.storyBackground, "Storybackground of title layer");
        
        this.initListeners();
    },

    initListeners: function() {
        var self = this;

        this._keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:function(key, event) {
                // check for BACK key (ESC on web)
                switch( key ) {
                case 32:
                case 18:
                    if( !self._settingsShown || self._settingsShown === $42.SETTINGS_HIDDEN || self._settingsShown === $42.ENDLEVEL_HIDDEN || self._settingsShown === $42.ENDGAME_HIDDEN || self._settingsShown === $42.ENDTWEET_HIDDEN  ) {
                        self._settingsShown = $42.SETTINGS_MOVING;
                        self.showSettings(function() {
                            self._settingsShown = $42.SETTINGS_SHOWN;
                        });
                    } else if( self._settingsShown === $42.SETTINGS_SHOWN ) {
                        self._settingsShown = $42.SETTINGS_MOVING;
                        self.hideSettings(function() {
                            self._settingsShown = $42.SETTINGS_HIDDEN;
                        });
                    }
                    break; 
				case 6:
				case 27:
					if (cc.sys.isNative && !$42.SCENE.mainLayer && (!self._settingsShown || self._settingsShown === $42.SETTINGS_HIDDEN || self._settingsShown === $42.ENDLEVEL_HIDDEN || self._settingsShown === $42.ENDGAME_HIDDEN || self._settingsShown === $42.ENDTWEET_HIDDEN)  ) {
                        self._settingsShown = $42.ENDGAME_MOVING;
						var menuItems = [];
						
						menuItems.push(
							new cc.MenuItemFont($42.t.want_to_end_game, function(sender) {
								cc.director.end();
								return;
							}, self)
						);

						menuItems.push(
							new cc.MenuItemFont($42.t.want_to_continue, function(sender) {
								$42._settingsLayer.hideSettings(function() {
									self._settingsShown = $42.ENDGAME_HIDDEN;
								});
							}, self)
						);

						menuItems[0].setFontSize(48);        	
						menuItems[1].setFontSize(48);  

						$42._settingsLayer.showEndLevel(menuItems, function() {
							self._settingsShown = $42.ENDGAME_SHOWN;
						});
					} else if( self._settingsShown === $42.ENDGAME_SHOWN ) {
						self._settingsShown = $42.ENDGAME_MOVING;
						$42._settingsLayer.hideSettings(function() {
							self._settingsShown = $42.ENDGAME_HIDDEN;
						});
					}
                    break;
                default:
                    cc.log(key);
                } 
            }
        });

	    cc.eventManager.addListener(this._keyboardListener, this);
    },

    initMenuListeners: function(sender, type) {
        switch (type) {
            case ccui.Slider.EVENT_PERCENT_CHANGED:
                var slider = sender,
                    percent = slider.getPercent();
                    
                if( slider.isMusicSlider ) {
                    cc.audioEngine.setMusicVolume(percent/100);
                } else {
                    cc.audioEngine.setEffectsVolume(percent/100);
                }
                break;
            default:
                break;
        }
    },

    showSettings: function(cb) {
        
        sb = this.storyBackground;

        this.addChild(sb);
        sb.setPosition(cc.p(cc.width,cc.height));
        sb.setOpacity($42.STORY_BACKGROUND_OPACITY);
        sb.setScale(0);
        sb.removeAllChildren();
        sb.runAction(
            cc.sequence(
                cc.EaseQuinticActionOut.create(
                    cc.spawn(
                        cc.scaleTo($42.STORY_BACKGROUND_SPEED, 1),
                        cc.moveTo($42.STORY_BACKGROUND_SPEED, $42.STORY_BACKGROUND_POS)
                    )
                ),
                cc.callFunc(function() {
                    cb();
                })
            )
        );

        var s = sb.getContentSize();

        var label = new cc.LabelTTF( $42.t.music_slider , _42_getFontName(res.exo_regular_ttf), 72);
        label.setPosition(cc.p(s.width/2,480));
        sb.addChild(label);
        
        var sl = new ccui.Slider();
        sl.setPercent($42.MUSIC_VOLUME*100);
        sl.setTouchEnabled(true);
        sl.loadBarTexture("res/images/ui/slider_pressbar.png");
        sl.loadSlidBallTextures("res/images/ui/slider_node_normal.png", "res/images/ui/slider_node_pressed.png", "");
        sl.loadProgressBarTexture("res/images/ui/slider_background.png");
        sl.setPosition(cc.p(s.width/2, 380));
        sl.addEventListener(this.initMenuListeners, this);
        sl.isMusicSlider = true;
        sb.addChild(sl);
        
        var label = new cc.LabelTTF( $42.t.effects_slider , _42_getFontName(res.exo_regular_ttf), 72);
        label.setPosition(cc.p(s.width/2,250));
        sb.addChild(label);
        
        var sl = this.effectsSlider = new ccui.Slider();
        sl.setPercent($42.EFFECTS_VOLUME*100);
        sl.setTouchEnabled(true);
        sl.loadBarTexture("res/images/ui/slider_pressbar.png");
        sl.loadSlidBallTextures("res/images/ui/slider_node_normal.png", "res/images/ui/slider_node_pressed.png", "");
        sl.loadProgressBarTexture("res/images/ui/slider_background.png");
        sl.setPosition(cc.p(s.width/2, 150));
        sl.addEventListener(this.initMenuListeners, this);
        sl.isMusicSlider = false;
        sb.addChild(sl);
    },
 
    hideSettings: function(cb) {
        
        var self = this;
        sb = this.storyBackground;

        sb.runAction(
            cc.EaseQuinticActionOut.create(
                cc.sequence(
                    cc.spawn(
                        cc.scaleTo($42.STORY_BACKGROUND_SPEED/2, 0),
                        cc.moveTo($42.STORY_BACKGROUND_SPEED/2,cc.p(cc.width,cc.height))
                    ),
                    cc.callFunc(function() {
                        self.removeChild(sb);
                        cb();
                    })
                )
            )
        );
    },

    showEndLevel: function(menuItems, cb) {
        var sb = this.storyBackground,
            width  = sb.getContentSize().width,
            height = sb.getContentSize().height;

        this.addChild(sb);
        sb.setPosition(cc.p(cc.width,cc.height));
        sb.setOpacity($42.STORY_BACKGROUND_OPACITY);
        sb.setScale(0);
        sb.removeAllChildren();
        sb.runAction(
            cc.sequence(
                cc.EaseQuinticActionOut.create(
                    cc.spawn(
                        cc.scaleTo($42.STORY_BACKGROUND_SPEED/3, 1),
                        cc.moveTo($42.STORY_BACKGROUND_SPEED/3, $42.STORY_BACKGROUND_POS)
                    )
                ),
                cc.callFunc(function() {
                    cb();
                })
            )
        );

        /////////////////////
        // Create menu
        var menu = this._menu = cc.Menu.create.apply(this, menuItems);
        menu.x = width/2;
        menu.y = height/2;
        menu.alignItemsVerticallyWithPadding(40);
        sb.addChild(menu);       
    }
});

var _42_retained = [];
var _42_retain = function(obj,name) {
    if( !obj ) debugger;
    obj.retain();

	obj.__retainId = _42_getId();

	_42_retained[obj.__retainId] = name;
	//cc.log("Retaining "+obj.__retainId+": '"+_42_retained[obj.__retainId]+"'");
};

var _42_release = function(obj) {
    
    if( !obj || !_42_retained[obj.__retainId] ) debugger;
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

_42_webConnect = function() {

    try {
        $42.websocket = new WebSocket($42.SERVER_ADDRESS);
    } catch(e) {
        cc.log("WebSocket connection to \""+$42.SERVER_ADDRESS+"\" failed.");
        return false;
    }

    $42.websocket.onopen = function(evt) { _42_onOpen(evt) };
    $42.websocket.onmessage = function(evt) { _42_onMessage(evt) };
    $42.websocket.onerror = function(evt) { _42_onError(evt); };
    $42.websocket.onclose = function(evt) { _42_onClose(evt); };        
}

_42_sendMessage = function( command, message, cb ) {
    if( !$42.webConnected ) return;

    var id = message.Id = _42_getId();

	message.Command = command;
    $42.websocket.send(JSON.stringify(message));		
    $42.webCallbacks[id] = cb;
}

_42_onOpen = function(evt) {
    $42.webConnected = true;
    
//    _42_sendMessage("testConnection", {}, function(data) {
//        cc.log("$42.webConnected message test ok.");
//    });
}

_42_onMessage = function(evt) {
    var self = this;

    try {
        var data = JSON.parse(evt.data);
    } catch (e) {
        throw "_42_onMessage: parse json message failed (" + e + ")";
    }

    if( data.Id && $42.webCallbacks[data.Id] ) {
        var id = data.Id;
        delete data.Id;
        $42.webCallbacks[id](data);
    }
}

_42_onError = function(evt) {
    $42.webConnected = false;
}

_42_onClose = function(evt) {
    $42.webConnected = false;
}

var _42Scene = cc.Scene.extend({
	
    onEnter:function () {
        var self = this;

        this._super();
	    
        $42.SCENE = this;
	
        // call tutorial module if available
        if( typeof _TWEET_MODULE === 'function' ) _TWEET_MODULE($42.SCENE);
        if( typeof _MURBIKS_MODULE === 'function' ) _MURBIKS_MODULE($42.SCENE);
        if( typeof _MUSIC_MODULE === 'function' ) _MUSIC_MODULE($42.SCENE);

        this.loadWords(function() {
            $42._titleLayer = new _42TitleLayer();
            self.addChild($42._titleLayer, 2, $42.TAG_TITLE_LAYER);
            
            $42._settingsLayer = new _42SettingsLayer();
            self.addChild($42._settingsLayer,10, $42.TAG_SETTINGS_LAYER);
        });

        _42_webConnect();
    },

    loadWords: function(cb) {
        
        var lg = $42.languagePack = cc.loader.getRes(res.language_pack),
            lv = $42.letterValues = cc.loader.getRes(res.language_letters),
            pv = $42.prefixValues = cc.loader.getRes(res.language_prefixes),
            w  = $42.words = cc.loader.getRes(res.language_words),
            letters = $42.LETTERS;

        $42.t = lg.apptext;
        $42.shorties = cc.loader.getRes(res.language_shorties);

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

