/*
 * BUGS
 * 
 * Tile placement
 * 
 * 1) correct rotation
 * 		tile doesn't rotate at the borders
 * 		rotating tiles multiple
 * 2) don't fix tiles while dragging
 */ 


var TAG_SPRITE_MANAGER = 1,
	TAG_MENU_LAYER = 2,
	TAG_GAME_LAYER = 3,
	BS = 64, // pixel
	BOXES_PER_COL = 22,
	GAME_OVER_COL = 16,
	BOXES_PER_ROW = 10,
	BOXES_X_OFFSET = 0,
	BOXES_Y_OFFSET = 0,
	SNAP_SPEED = 10.0, // pixel per 1/60
	FALLING_SPEED = 1.0, // pixel per 1/60
	MOVE_SPEED = 0.09, // seconds
    TOUCH_THRESHOLD = 6, // pixel
	KEY_LEFT_CODE = 37,
	KEY_UP_CODE = 38,
	KEY_RIGHT_CODE = 39,
	KEY_DOWN_CODE = 40,
	LETTER_NAMES = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","oe","ue"],
	TILE_BOXES = [
	              [{x:-1.5*BS,y: 0.0*BS},{x:-0.5*BS,y: 0.0*BS},{x: 0.5*BS,y: 0.0*BS},{x: 1.5*BS,y: 0.0*BS}],
	              [{x:-0.5*BS,y:-0.5*BS},{x:-0.5*BS,y: 0.5*BS},{x: 0.5*BS,y:-0.5*BS},{x: 0.5*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x:-1.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 1.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 0.0*BS,y:-0.5*BS},{x: 1.0*BS,y:-0.5*BS}],
	              [{x:-1.0*BS,y:-0.5*BS},{x: 0.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS},{x: 0.0*BS,y:-0.5*BS}],
	              ];

var MuprisGameLayer = cc.Layer.extend({
    sprite:null,
    
    tiles: [],
	boxes: [],
	
    touchStartPoint: null,
    touchCurrentPoint: null,
    touchLastPoint: null,
    touchDistance: null,
    isSwipeUp: false,
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeDown: false,    
    isTap: false,
    
    ctor:function () {
        this._super();

        var size = this.size = cc.director.getWinSize();

        this.startAnimation();
        this.loadImages();
        this.initBoxSpace();
        
	    this.tiles = [];
        return true;
    },

    onEnter: function() {
    	var self = this;
		this._super();

		this.initListeners();
		
		setTimeout(function() {
		    self.scheduleUpdate();				
		},5000);
    },
    
    onExit: function() {
		this._super();

	    this.stopListeners();
	    this.unscheduleUpdate();	    	
    },
    
	startAnimation: function() {
		
        var size = this.size,
        	closeItem = cc.MenuItemImage.create(
            res.CloseNormal_png,
            res.CloseSelected_png,
            function () {
                cc.log("Menu is clicked!");
            }, this);
        closeItem.attr({
            x: size.width - 20,
            y: 20,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = cc.Menu.create(closeItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 1);

        var background = cc.Sprite.create(res.background_png);
        background.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 1,
            rotation: 0
        });
        this.addChild(background, 0);
        var title = cc.Sprite.create(res.title_png);
        title.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 1.5,
            rotation: 0,
        });
        this.addChild(title, 1);

        var sequenceA = cc.fadeIn(3);
        var sequenceB = cc.Spawn.create(cc.rotateTo(2,0),cc.scaleTo(2,10,10),cc.fadeOut(2));
//,cc.fadeOut(2)
        title.setOpacity(0);
        title.runAction(cc.sequence(sequenceA,sequenceB));
	},
	
	loadImages: function() {
		// Load sprite frames to frame cache, add texture node
        cc.spriteFrameCache.addSpriteFrames(res.letters_plist);
        var lettersTexture = cc.textureCache.addImage(res.letters_png),
        	lettersImages  = cc.SpriteBatchNode.create(lettersTexture,200);
		this.addChild(lettersImages, 0, TAG_SPRITE_MANAGER);
	},
	
	initBoxSpace: function() {
	    // initialize boxes arrays
	    for( var i=0 ; i<BOXES_PER_COL ; i++ ) {
		    for( var j=0 ; j<BOXES_PER_ROW ; j++ ) {
		    	if( !this.boxes[i] ) this.boxes[i] = []; 
		    	this.boxes[i][j] = null;		    	
		    }		    	
	    }

	    // draw grid
	    this.drawNode = cc.DrawNode.create();
        this.addChild(this.drawNode,100);
        this.drawNode.clear();
        for( var i=0 ; i<=BOXES_PER_ROW ; i++ ) {
            this.drawNode.drawSegment(cc.p(BOXES_X_OFFSET+i*BS,BOXES_Y_OFFSET), 
            						  cc.p(BOXES_X_OFFSET+i*BS,BOXES_Y_OFFSET+BOXES_PER_COL*BS),
            						  1,
            						  cc.color(255,100,100,60));         	
        }
        for( var i=0 ; i<=BOXES_PER_COL ; i++ ) {
            this.drawNode.drawSegment(cc.p(BOXES_X_OFFSET,BOXES_Y_OFFSET+i*BS), 
            						  cc.p(BOXES_X_OFFSET+BOXES_PER_ROW*BS,BOXES_Y_OFFSET+i*BS),
            						  1,
            						  cc.color(255,100,100,30));         	
        }
	},
	
    initListeners: function() {
       	var self = this;
	
	/*
	 * TOUCH EVENTS
	 */ 
       	
       	if( true || 'touches' in cc.sys.capabilities ) { // touches work on mac but return false
	    	this._touchListener = cc.EventListener.create({
	            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
	            onTouchesBegan: function(touches, event) {
	            	
	            	var touch = touches[0];
	                var loc = touch.getLocation();
	                
	                self.touchStartPoint = {
	                	x: loc.x,
	                	y: loc.y
	                };
	                
	                self.touchLastPoint = {
	                    	x: loc.x,
	                    	y: loc.y
	                };
	            },
	            	
	            onTouchesMoved: function(touches, event) {
	            	var touch = touches[0];
	                var loc = touch.getLocation(),
	                	start = self.touchStartPoint;
	
	                self.touchDistance = {
	            			x: Math.abs(loc.x - start.x),
	            			y: Math.abs(loc.y - start.y)
	            	}
	                
	                // check for left
	                if( loc.x < start.x - TOUCH_THRESHOLD) {
		            //if( loc.x < start.x - TOUCH_THRESHOLD && self.touchDistance.x > self.touchDistance.y) {
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
	                if( loc.x > start.x + TOUCH_THRESHOLD ) {
		            //if( loc.x > start.x + TOUCH_THRESHOLD && self.touchDistance.x > self.touchDistance.y) {
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
	                if( loc.y < start.y - TOUCH_THRESHOLD * 3 ) {
		            //if( loc.y < start.y - TOUCH_THRESHOLD * 3 && self.touchDistance.y > self.touchDistance.x) {
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
	                if( loc.y > start.y + TOUCH_THRESHOLD ) {
		            //if( loc.y > start.y + TOUCH_THRESHOLD && self.touchDistance.y > self.touchDistance.x) {
	                	// if direction changed while swiping right, set new base point
	                	if( loc.y < self.touchLastPoint.y ) {
	                		self.touchStartPoint = {
	                        		x: loc.x,
	                        		y: loc.y
	                        };
	                		self.isSwipeUp = false;
	                	} else {
	                    	self.isSwipeUp = true;                		
	                	}
	                }
	                
	                self.touchLastPoint = {
	                		x: loc.x,
	                		y: loc.y
	                };
	            },
	            	
	            onTouchesEnded: function(touches, event){
	            	//console.log("onTouchesEnded!");
	
	            	var touch = touches[0],
	            		loc = touch.getLocation()
	            		size = self.size;
	                
	                self.touchStartPoint = null;
	                
	                if(!self.isSwipeUp && !self.isSwipeLeft && !self.isSwipeRight && !self.isSwipeDown) {
	                	self.isTap = true;
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
       	
/*       TEST SUITE CODE
  		if( 'keyboard' in cc.sys.capabilities ) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed:function(key, event) {
                    cc.log("Key down:" + key);
                },
                onKeyReleased:function(key, event) {
                    cc.log("Key up:" + key);
                }
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }*/

	    if( 'keyboard' in cc.sys.capabilities ) {
	        this._keyboardListener = cc.EventListener.create({
	            event: cc.EventListener.KEYBOARD,
	            onKeyPressed:function(key, event) {
	            	switch(key) {
	            	case KEY_LEFT_CODE:
	            		self.isSwipeLeft = true;
	            		break;
	            	case KEY_RIGHT_CODE:
	            		self.isSwipeRight = true;
	            		break;
	            	case KEY_UP_CODE:
	            		self.isSwipeUp = true;
	            		break;
	            	case KEY_DOWN_CODE:
	            		self.isSwipeDown = true;
	            		break;
	            	}
	            },
	            onKeyReleased:function(key, event) {
	            	switch(key) {
	            	case KEY_LEFT_CODE:
	            		self.isSwipeLeft = false;
	            		break;
	            	case KEY_RIGHT_CODE:
	            		self.isSwipeRight = false;
	            		break;
	            	case KEY_UP_CODE:
	            		self.isSwipeUp = false;
	            		break;
	            	case KEY_DOWN_CODE:
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
    
    stopListeners: function() {
        cc.eventManager.removeListener(this._touchListener, this);
        cc.eventManager.removeListener(this._keyboardListener, this);
    },

	buildTile: function(p) {
		
		// select a random tile type
		var tileBoxes = TILE_BOXES[Math.floor(Math.random()*TILE_BOXES.length)];
		
		//tileBoxes = TILE_BOXES[Math.floor(Math.random()*1)+0];

		// create sprite for tile and set is size 0, we only use its position and rotation
		var tileSprite = cc.Sprite.create(res.letters_png,cc.rect(0,0,0,0)),
			batch = this.getChildByTag(TAG_SPRITE_MANAGER);
		
		// set tile sprite to a column
		p.x = Math.round(p.x/BS)*BS+(32-(Math.abs(tileBoxes[0].x)%BS));
		cc.assert(p.x%(BS/2) === 0, "Mupris, buildTile: Tile is not aligned to column.");
        tileSprite.setPosition(p);
        batch.addChild(tileSprite);

        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var letter = LETTER_NAMES[Math.floor(Math.random()*LETTER_NAMES.length)],
        		spriteFrame = cc.spriteFrameCache.getSpriteFrame(letter+".png"),
        		sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,BS,BS));
        	
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
	        tileSprite.addChild(sprite);
        }
        
        // build a tile object
        this.tiles.push({
        	boxes: tileBoxes,
        	sprite: tileSprite,
        	rotation: 0,
        	direction: 0,  // 0, -1, 1 
        	rotating : false,
        	action: null
        });
        
        tileSprite.setRotation(0);
		rt = this.rotateBoxes(this.tiles[this.tiles.length-1]);
		
		//tileSprite.children[0].runAction(cc.tintTo(1,0,0,0));
	},
	
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
	
    update: function(dt) {
    	
    	var self = this,
			size = this.size;

    	/*
    	 * get current row / col of a box
    	 */
    	var getRowCol = function(box, lp) {
    		return {
    			col: Math.round((lp.x + box.x - BOXES_X_OFFSET - BS/2) / BS),
    			row: Math.round((lp.y + box.y - BOXES_X_OFFSET - BS) / BS),
    		}
    	};
    	
    	/*
    	 * check if a collision happened
    	 */
    	var checkForBottom = function(t, lp) {
    		var b = t.rotatedBoxes;
    		
    		for( var i=0 ; i<b.length ; i++ ) {
    			var bx = lp.x + b[i].x,
    				by = lp.y + b[i].y,
    				brc = getRowCol(b[i], lp);
    			    	
    			// check for bottom or fixed boxes
    			if( by - BS/2 <= BOXES_Y_OFFSET || 
    				(brc.row < BOXES_PER_COL && self.boxes[brc.row][brc.col]) ) {

    				// align y to box border
    				cc.log("checkForBottom, lp.y = "+lp.y);
    				lp.y = Math.round((lp.y - BOXES_Y_OFFSET)/(BS/2))*(BS/2) + BOXES_Y_OFFSET;
    				
    				// fix tile
    				if( !t.isDragged ) {
    					
        				cc.log("Bottom reached, tile is fixed at "+lp.y);
    					return fixTile(t, lp);
    				}
    				else cc.log("Bottom reached, is still dragging ... lp.y = "+lp.y);
    			}
    		}

    		return false;
    	};
    	
    	var moveHorizontalyAndCheckForBarrier = function(t, lp, tp) {
    		var b = t.rotatedBoxes,
    			offset = 32-(Math.abs(t.rotatedBoxes[0].x) % BS),
    			dir = Math.sign(tp.x-lp.x);
    		
    		cc.assert(offset === 32 || offset === 0, "Mupris, moveHorizontalyAndCheckForBarrier: offset incorrect ("+offset+").");

			// set a maximum horizontal speed
			lp.x = (Math.abs(tp.x - lp.x) < BS)? tp.x : lp.x + BS * dir - 1;

			var newX = null;
    		for( var i=0 ; i<t.boxes.length ; i++) {
    			
        		var brc = getRowCol(b[i], { x: lp.x-BS/2, y: lp.y} );
    			// check for left and right border
    			if( dir === -1 ) {
    				if (lp.x + t.rotatedBoxes[i].x - BS/2 - BOXES_X_OFFSET < 0 ) {
    					var x = -t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.max(newX , -t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET);
    				}
    				
    				if( self.boxes[brc.row][brc.col] ) {
    					var x = (brc.col+1) * BS - t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.max(newX , brc.col * BS - t.rotatedBoxes[i].x - BS/2 + BOXES_X_OFFSET);
    				}
    			} else {
    				if (lp.x + t.rotatedBoxes[i].x + BS/2 - BOXES_X_OFFSET >= BOXES_PER_ROW * BS ) {
    					var x = BOXES_PER_ROW * BS - t.rotatedBoxes[i].x - BS/2 + BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.min(newX , BOXES_PER_ROW * BS - t.rotatedBoxes[i].x - BS/2 + BOXES_X_OFFSET);
    				}

    				if( self.boxes[brc.row][brc.col+1] ) {
    					var x = brc.col * BS - t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.min(newX , brc.col * BS - t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET);
        				cc.log("Setting newX to "+newX+" for box "+i);
    				}

    			}
    		}
    		
    		if( newX ) {
    			lp.x = newX;
    		}
    		
    		return true;
    	};
    	
		var alignToColumn = function(t, lp, offset, doneFn) {
			if( offset === undefined ) {
				var tileOffset = BS/2 - Math.abs(t.rotatedBoxes[0].x%BS),
					offset = (lp.x-BOXES_X_OFFSET-tileOffset)%BS;
				
				offset = offset < BS/2? -offset : BS - offset;
				//cc.log("tileOffset = "+tileOffset+", offset = "+offset);
				
			} else {
				//cc.assert((lp.x-BOXES_X_OFFSET)%(BS*2) == 0, "Mupris, main loop, align to column: Tile must be aligned.");
				var offset = offset - Math.abs(t.rotatedBoxes[0].x%BS);
				
			}
			
			var targetX = lp.x + offset;
			
			if( offset ) {
				//cc.log("Mupris, main loop, align to column start: lp.x ="+lp.x+", targetX = "+targetX+", t.direction = "+t.direction);
				t.isAligning = true;
				t.sprite.runAction(cc.sequence( 
					cc.moveBy(MOVE_SPEED,cc.p(offset,0)),
					cc.callFunc(function() {
		    			var lp = t.sprite.getPosition();
						//.log("Mupris, main loop,  align to column end: lp.x ="+lp.x+", set to targetX = "+targetX);
		    			t.sprite.setPosition(targetX, lp.y);
		    			t.isAligning = false;
		    			if( doneFn && typeof doneFn === "function" ) doneFn();
					}, self)
				));						
			} else {
				if( doneFn && typeof doneFn === "function" ) doneFn();
			}
		};
    	
    	var rotateTile = function rotate(t,lp,offset) {
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
					cc.log("Mupris, main loop, Correcting Tile! start: lp.x ="+lp.x+", targetX = "+targetX+", t.direction = "+t.direction);
					if( t.direction ) {
						t.sprite.runAction(cc.sequence( 
								cc.moveBy(MOVE_SPEED*2,cc.p(shiftTile,0)),
								cc.callFunc(function() {
					    			var lp = t.sprite.getPosition();
									cc.log("Mupris, main loop, Correcting Tile! end: lp.x ="+lp.x+", set to targetX = "+targetX);
					    			t.sprite.setPosition(targetX, lp.y);
					    			t.direction = 0;
								}, self)
						));						
					}
				}
				
				cc.log("Mupris, main loop, run rotation action: lp.x ="+lp.x+", set to targetX = "+targetX);
				t.sprite.runAction(cc.sequence( 
					cc.rotateTo(MOVE_SPEED*2,t.rotation),
					cc.callFunc(function() {
						var lp = t.sprite.getPosition();
												
						// if after rotation user is still swiping up ...
						if( self.isSwipeUp ) {
							cc.log("Mupris, main loop, start rotating again: lp.x ="+lp.x+", set to targetX = "+targetX);

							if( !rotate(t , lp, offset) ) {
								cc.log("Mupris, main loop, stop rotating again: lp.x ="+lp.x+", set to targetX = "+targetX);
								if( !shiftTile ) alignToColumn(t, lp, offset);
								t.rotating = false;
								return false;
							};
						} else {
							cc.log("Mupris, main loop, stop rotating: lp.x ="+lp.x+", set to targetX = "+targetX);
							t.rotating = false;							
							if( !shiftTile ) alignToColumn(t, lp, offset);
							return false;
						}
					}, self)
				));
				
				return true;
			} else {
				t.rotating = false;
				t.rotation = oldRotation;
				self.rotateBoxes(t);  
				
				return false;
			}
    		
    	};
    	
    	var checkRotation = function(t, lp) {
    		
    		var b = t.rotatedBoxes,
    			minOffset = 0,
    			maxOffset = 0;
    		
    		for( var i=0 ; i<b.length ; i++) {
        		var brc = getRowCol(b[i], lp);
        		
        		minOffset = Math.min(minOffset, lp.x + b[i].x - BOXES_X_OFFSET - BS/2);
        		maxOffset = Math.max(maxOffset, lp.x + b[i].x - BOXES_X_OFFSET + BS/2);
        		
        		if( brc.row < 0 || self.boxes[brc.row][brc.col] ) return "collision";
    		}
    		
    		if( minOffset < 0 || maxOffset > BOXES_PER_ROW * BS ) {
    			var offset = minOffset? minOffset : maxOffset - BOXES_PER_ROW * BS,
    				newLp = {
    					x: lp.x - offset,
    					y: lp.y
        			};
    				
    			if( checkRotation(t , newLp) === "ok" ) return offset;
    			else return "collision";
    		} 
    			
    		return "ok";
    	};
    	
    	/*
    	 * Tile gets fixed on the ground
    	 */
    	var fixTile = function fixTile(t, lp) {
    		var batch = self.getChildByTag(TAG_SPRITE_MANAGER),
    			b = t.rotatedBoxes,
    			ret = "ok";
    		
    		// check if a tile is in the Game over row
    		for( var i=0 ; i<b.length ; i++ ) {
				var brc = getRowCol(b[i], lp);
				if( brc.row >= GAME_OVER_COL ) {
					ret = "gameover";
				}
				if( brc.row < 0 || self.boxes[brc.row][brc.col] != null ) {
					// if a box is occupied already, move tile one up 
					return fixTile(t, {x:lp.x,y:lp.y+BS});
				}
    		}
    		
    		// fix single tiles in batch sprite
    		if( ret !== "gameover" ) {
        		for( var i=0 ; i<b.length ; i++) {
            		// create a new sprite from the old child sprite
        			var sprite = t.sprite.children[i],
        				newSprite = cc.Sprite.create(sprite.getTexture(), sprite.getTextureRect());

        			// Insert into boxes array
    				var brc = getRowCol(b[i], lp);
        			
        			newSprite.setPosition(BOXES_X_OFFSET + brc.col*BS + BS/2 , BOXES_Y_OFFSET + brc.row*BS + BS/2);
        	        batch.addChild(newSprite);

            		self.boxes[brc.row][brc.col] = newSprite;     					
        		}    			
    		}
    		
    		batch.removeChild(t.sprite);
    		delete t;
    		
    		checkForAndRemoveCompleteRows();

    		return ret;
    	};
    	
    	var checkForAndRemoveCompleteRows = function() {
    		
    		// always check all rows for now
    		var rowsDeleted = [];
    		for( var i=0 ; i<BOXES_PER_COL ; i++ ) {
    			for( j=0 ; j<BOXES_PER_ROW ; j++ ) {
    				if(!self.boxes[i][j]) break;
    			}
    			if(j === BOXES_PER_ROW) {
    				deleteRow(i);
    				rowsDeleted.push(i);
    			}
    		}
    		
    		// move rows above deleted rows down
    		if( rowsDeleted.length ) {
    			var r = 0,
					rows = 1,
					row = rowsDeleted[r],
					nextRow = rowsDeleted[++r] || null;

    			for( var i=row ; i<BOXES_PER_COL ; i++ ) {
    				
					while( i+rows == nextRow) {
						nextRow = rowsDeleted[++r] || null;
						rows++;
					}

					for( var j=0 ; j<BOXES_PER_ROW ; j++ ) {
						
						var sprite = (self.boxes[i+rows] && self.boxes[i+rows][j]) || null;
						if( sprite ) {
							sprite.runAction(cc.moveBy(MOVE_SPEED*rows, cc.p(0,-BS*rows)));
						}
						
						self.boxes[i][j] = (self.boxes[i+rows] && self.boxes[i+rows][j]) || null;
					}					
				}
    		}
    	};
    	
       	var deleteRow = function(row) {

        	var batch = self.getChildByTag(TAG_SPRITE_MANAGER);

        	// delete row ... 
        	for( var i=0 ; i<BOXES_PER_ROW ; i++ ) {
        		// destroy sprite and body
            	batch.removeChild(self.boxes[row][i]);
		    	self.boxes[row][i] = null;		    	
    		}        	
    	};

    	// if there is no tile flying, build a new one
        var tilesFlying = self.tiles.filter(function(value) { return value !== undefined }).length;
        if( !tilesFlying ) {
            self.buildTile(cc.p(Math.random()*(BOXES_PER_ROW-4)*BS+BOXES_X_OFFSET+2*BS, size.height+BS));        	
        }
        
        var isSwipe = function() {
        	return self.isSwipeLeft || self.isSwipeRight || self.isSwipeUp || self.isSwipeDown;
        }

    	/*
    	 * Main loop to move tiles
    	 */
    	for( tile in self.tiles ) {
    		var t = self.tiles[tile],
    			lp = t.sprite.getPosition(),
    			sp = self.touchStartPoint,
    			tp = self.touchLastPoint,
    			fallingSpeed = FALLING_SPEED;
    		
    		// align x with pixels
    		lp.x = Math.round(lp.x); // lp.x manipulated by MoveBy seem to be not precise

    		/*
    		 * Move tile left and right
    		 */
    		if( !t.isDragged && !t.isAligning ) {

    			cc.assert(lp.x%(BS/2) === 0, "Mupris, main loop: Tile is not aligned to column. (lp.x = "+lp.x+")");
    			
	    		if( isSwipe() &&
	    			sp.x < lp.x + BS*2 && sp.x > lp.x - BS*2 &&
	    			sp.y < lp.y + BS*2 && sp.y > lp.y - BS*2	) { // move the tile if the touch is in range
	  
	    			t.isDragged = true;
	    		}
	    		
	    		if( !t.rotating ) {
	    			if( self.isTap ) {
	    				self.isTap = false;
	    				var oldOffset = Math.abs(t.rotatedBoxes[0].x % BS);
	    				
	    				t.rotating = true;
	    				
	    				rotateTile(t , lp , oldOffset);
	    			}
	    		}	    			    		
    		} else {

				cc.log("touchStartPoint?");

    			if(self.touchStartPoint == null) {
    				// align to column
    				cc.log("self.touchStartPoint is null!");
    				if( !t.isAligning ) {
        				alignToColumn(t,lp,undefined,function() {
        					t.isDragged = false;    					
        				});    					
    				}
    			} else {

    	    		if( moveHorizontalyAndCheckForBarrier(t,lp,tp) )
        			//lp.y = Math.min( lp.y , tp.y );
        			
    	    		if(tp.y < lp.y) {
    	    			var fallingSpeed = FALLING_SPEED * 12;
    	    		}
    	    		
    			}
    		}
    		
	    	
    		// let tile fall down
    		lp.y -= fallingSpeed;
    		
    		var ret;
    		if( ret = checkForBottom(t, lp) ) {
    			// tile landed ...
    			delete self.tiles[tile];

    			if( ret == "gameover" ) {
    	            this.getParent().addChild(
    	            	new MuprisMenuLayer(new cc.Color(40,0,0,160),size.width,size.height),
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

var MuprisMenuLayer = cc.LayerColor.extend({
    
    ctor:function (color, width, height) {
        this._super(color, width, height);

        var size = this.size = cc.director.getWinSize(),
        	self = this;            
            
        this.initMenu(color, width, height);
        
        return true;
    },

	initMenu: function(color, width, height) {
		
        var size = this.size,
        	self = this;

        var item1 = cc.MenuItemFont.create("RESUME", function(sender) {
        	var gameLayer = this.getParent().getChildByTag(TAG_GAME_LAYER);
	        gameLayer.resume();
	        gameLayer.scheduleUpdate();

            this.getParent().removeChild(this);
        }, this);
        
        var item2 = cc.MenuItemFont.create("RESTART", function(sender) {
        	cc.director.runScene(new MuprisScene());
        }, this);

        item1.setFontSize(48);
        item2.setFontSize(48);

        var menu = cc.Menu.create(item1, item2);
        menu.x = size.width/2;
        menu.y = 480;
        this.addChild(menu, 1);       
        menu.alignItemsVertically();
	}
});

var MuprisScene = cc.Scene.extend({
	menuLayer: null,
	
	getMenuLayer: function() {
		return this.menuLayer;
	},
	
    onEnter:function () {
        this._super();
        
        this.menuLayer = new MuprisMenuLayer();
        
        this.addChild(new MuprisGameLayer(), 1, TAG_GAME_LAYER);
    }
});



