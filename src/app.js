// weiter: Bewegen nach rotieren -> assert
//			Mehrfachdrehung
// 			Kollision mit boxen


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
	            	//console.log("onTouchesBegan!");
	            	
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
	                if( loc.x < start.x - TOUCH_THRESHOLD && self.touchDistance.x > self.touchDistance.y) {
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
	                if( loc.x > start.x + TOUCH_THRESHOLD && self.touchDistance.x > self.touchDistance.y) {
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
	                if( loc.y < start.y - TOUCH_THRESHOLD * 3 && self.touchDistance.y > self.touchDistance.x) {
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
	                if( loc.y > start.y + TOUCH_THRESHOLD && self.touchDistance.y > self.touchDistance.x) {
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
	                
	                self.isSwipeUp = self.isSwipeLeft = self.isSwipeRight = self.isSwipeDown = false;
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
		
		//tileBoxes = TILE_BOXES[Math.floor(Math.random()*4)+0];

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
    	var checkForCollision = function(t, lp) {
    		var b = t.rotatedBoxes;
    		
    		for( var i=0 ; i<b.length ; i++ ) {
    			var bx = lp.x + b[i].x,
    				by = lp.y + b[i].y,
    				brc = getRowCol(b[i], lp);
    			    	
    			// check for bottom or fixed boxes
    			if( by - BS/2 <= BOXES_Y_OFFSET || 
    				(brc.row < BOXES_PER_COL && self.boxes[brc.row][brc.col]) ) {

    				// align y to box border
    				lp.y = Math.round((lp.y - BOXES_Y_OFFSET)/(BS/2))*(BS/2) + BOXES_Y_OFFSET;
    				
    				// fix tile
    				return fixTile(t, lp);
    			}
    		}

    		return false;
    	};
    	
    	var checkForBarrier = function(t, lp, dir) {
    		var offset = 32-(Math.abs(t.boxes[0].x) % BS);
    		cc.assert(offset === 32 || offset === 0, "Mupris, checkForBarrier: offset incorrect ("+offset+").");
			cc.assert((lp.x+offset)%BS === 0, "Mupris, checkForBarrier: Tile is not aligned to column. lp.x = "+lp.x+", offset = "+offset);

			// check for left and right walls or tiles in the way
    		for( var i=0 ; i<t.boxes.length ; i++) {

    			// check for left and right border
    			if( dir === "left" && lp.x + t.boxes[i].x - BS/2 <= BOXES_X_OFFSET ||
    				dir === "right" && lp.x + t.boxes[i].x + BS/2 >= BOXES_X_OFFSET + BOXES_PER_ROW*BS ) {
    				return false;
    			}    			
    		}
    		
    		return true;
    	};
    	
		var alignToColumn = function(t, lp, offset) {
			var shiftTile = offset - Math.abs(t.rotatedBoxes[0].x%BS),
				targetX = lp.x + shiftTile,
				t1 = t;
			t.direction = Math.sign(shiftTile);
			//cc.log("Mupris, main loop, align to column start: lp.x ="+lp.x+", targetX = "+targetX+", t.direction = "+t.direction);
			t.sprite.runAction(cc.sequence( 
				cc.moveBy(MOVE_SPEED,cc.p(shiftTile,0)),
				cc.callFunc(function() {
	    			var lp = t.sprite.getPosition();
					//cc.log("Mupris, main loop,  align to column end: lp.x ="+lp.x+", set to targetX = "+targetX);
	    			t.sprite.setPosition(targetX, lp.y);
	    			t1.direction = 0;
				}, self)
			));						
		};
    	
    	var rotateTile = function rotate(t,lp,offset) {
			var oldRotation = t.rotation;
			t.rotation = (t.rotation + 90)%360;
			self.rotateBoxes(t);
	
			// shift Tile if it needs to be align to column after rotation
			var check = checkRotation(t, lp);
			
			if( check != "collision" ) {
				// shift tile, if it would not fit into playground after rotation
				var shiftTile = (parseInt(check) || 0)*BS;
				
				if(shiftTile != 0) {
					var targetX = lp.x + shiftTile;
					t.direction = Math.sign(shiftTile);
					cc.log("Mupris, main loop, Correcting Tile! start: lp.x ="+lp.x+", targetX = "+targetX+", t.direction = "+t.direction);
					if( t.direction ) {
						t.sprite.runAction(cc.sequence( 
								cc.moveBy(MOVE_SPEED/2,cc.p(-shiftTile,0)),
								cc.callFunc(function() {
					    			var lp = t.sprite.getPosition();
									cc.log("Mupris, main loop, Correcting Tile! end: lp.x ="+lp.x+", set to targetX = "+targetX);
					    			t.sprite.setPosition(targetX, lp.y);
					    			t.direction = 0;
								}, self)
						));						
					}
				}
				
				t.sprite.runAction(cc.sequence( 
					cc.rotateTo(MOVE_SPEED*2,t.rotation),
					cc.callFunc(function() {
												
						// if after rotation user is still swiping up ...
						if( self.isSwipeUp ) {
							cc.log("Mupris, main loop, start rotating again: lp.x ="+lp.x+", set to targetX = "+targetX);

							if( !rotate(t , lp, offset) ) {
								cc.log("Mupris, main loop, stop rotating again: lp.x ="+lp.x+", set to targetX = "+targetX);
								t.rotating = false;
								alignToColumn(t, lp, offset);
							};
						} else {
							cc.log("Mupris, main loop, stop rotating: lp.x ="+lp.x+", set to targetX = "+targetX);
							t.rotating = false;							
							alignToColumn(t, lp, offset);
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
    			minCol = 0,
    			maxCol = 0;
    		
    		for( var i=0 ; i<b.length ; i++) {
        		var brc = getRowCol(b[i], lp);
        		
        		minCol = Math.min(minCol, brc.col);
        		maxCol = Math.max(maxCol, brc.col);
        		
        		if( brc.row < 0 || self.boxes[brc.row][brc.col] ) return "collision";
    		}
    		
    		if( minCol < 0 || maxCol >= BOXES_PER_ROW ) {
    			var offset = minCol? minCol : maxCol - BOXES_PER_ROW + 1,
    				newLp = {
    					x: lp.x - offset * BS,
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
    	var fixTile = function(t, lp) {
    		var batch = self.getChildByTag(TAG_SPRITE_MANAGER),
    			b = t.rotatedBoxes,
    			ret = "ok";
    		
    		// check if a tile is in the Game over row
    		for( var i=0 ; i<b.length ; i++ ) {
				var brc = getRowCol(b[i], lp);
				if( brc.row >= GAME_OVER_COL ) {
					ret = "gameover";
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

    	if( self.isSwipeDown ) {
    		if( !self.isSwiping && self.tiles[self.tiles.length-1].sprite.getPosition().x < size.height - BS*2) {
    			self.isSwiping = true;

                self.buildTile(cc.p(Math.random()*(BOXES_PER_ROW-4)*BS+BOXES_X_OFFSET+2*BS, size.height+BS));        	    			
    		} 
    	} else {
    		self.isSwiping = false;
    	}
    	// if there is no tile flying, build a new one
        var tilesFlying = self.tiles.filter(function(value) { return value !== undefined }).length;
        if( !tilesFlying ) {
            self.buildTile(cc.p(Math.random()*(BOXES_PER_ROW-4)*BS+BOXES_X_OFFSET+2*BS, size.height+BS));        	
        }

    	/*
    	 * Main loop to move tiles
    	 */
    	for( tile in self.tiles ) {
    		var t = self.tiles[tile],
    			lp = t.sprite.getPosition();
    		
    		// align x with pixels
    		lp.x = Math.round(lp.x); // lp.x manipulated by MoveBy seem to be not precise
    		
    		/*
    		 * Move tile left and right
    		 */
    		if( true || tile == self.tiles.length-1 ) { // move only the last tile
    			
	    		if( t.direction === 0 ) {

	    			cc.assert(lp.x%(BS/2) === 0, "Mupris, main loop: Tile is not aligned to column. (lp.x = "+lp.x+")");
	    			if( self.isSwipeLeft && checkForBarrier(t,lp,"left") ) {
	    				var t1 = t, targetX = lp.x - BS;
	    				t.direction = -1;
	    				t.sprite.runAction(cc.sequence( 
	    					cc.moveTo(MOVE_SPEED,cc.p( targetX , lp.y )),
	    					cc.callFunc(function() {
	    		    			var lp = t.sprite.getPosition();
	    		    			t.sprite.setPosition(targetX, lp.y);
	    						t1.direction = 0;
	    					}, self)
	    				));
	    			} else if( self.isSwipeRight && checkForBarrier(t,lp,"right") ) {
	    				var t1 = t, targetX = lp.x + BS;
	    				t.direction = 1;
	    				t.sprite.runAction(cc.sequence( 
	    					cc.moveTo(MOVE_SPEED,cc.p( targetX , lp.y )),
	    					cc.callFunc(function() {
	    		    			var lp = t.sprite.getPosition();
	    		    			t.sprite.setPosition(targetX, lp.y);
	    		    			t1.direction = 0;
	    					}, self)
	    				));
	    			}     			
	    		} else if( !self.isSwipeLeft && !self.isSwipeRight ) {
	    		}
	    		
	    		if( !t.rotating ) {
	    			if( self.isSwipeUp && !(self.isSwipeLeft || self.isSwipeRight) ) {
	    				var oldOffset = Math.abs(t.rotatedBoxes[0].x % BS);
	    				
	    				t.rotating = true;
	    				
	    				rotateTile(t , lp , oldOffset);
	    			}
	    		}
	    		
	    		var fallingSpeed = FALLING_SPEED;
    		} 
    		
    		if(tile != self.tiles.length-1) {
    			var fallingSpeed = FALLING_SPEED * 12;
    		}
	    	
    		// let tile fall down
    		lp.y -= fallingSpeed;
    		
    		var ret;
    		if( ret = checkForCollision(t, lp) ) {
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



