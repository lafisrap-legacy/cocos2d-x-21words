var TAG_SPRITE_MANAGER = 1,
	BOXES_PER_COL = 28,
	BOXES_PER_ROW = 10,
	BOXES_X_OFFSET = 32,
	BOXES_Y_OFFSET = 32,
	SNAP_SPEED = 1,
	MOVE_SPEED = 0.09,
    TOUCH_THRESHOLD = 3,
	FALLING_SPEED = 0.50,
	KEY_LEFT_CODE = 37,
	KEY_UP_CODE = 38,
	KEY_RIGHT_CODE = 39,
	KEY_DOWN_CODE = 40,
	BS = 32, // pixel
	LETTER_NAMES = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","oe","ue","ss"],
	TILE_BOXES = [
	              [{x:-1.5*BS,y: 0.0*BS},{x:-0.5*BS,y: 0.0*BS},{x: 0.5*BS,y: 0.0*BS},{x: 1.5*BS,y: 0.0*BS}],
	              [{x:-0.5*BS,y:-0.5*BS},{x:-0.5*BS,y: 0.5*BS},{x: 0.5*BS,y:-0.5*BS},{x: 0.5*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x:-1.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 1.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 0.0*BS,y:-0.5*BS},{x: 1.0*BS,y:-0.5*BS}],
	              [{x:-1.0*BS,y:-0.5*BS},{x: 0.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS},{x: 0.0*BS,y:-0.5*BS}],
	              ];

var MutrixLayer = cc.Layer.extend({
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
        this.initListeners();

	    this.scheduleUpdate();	
        return true;
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
        this.helloLabel = cc.LabelTTF.create("MUPRIS -- Tetris & Letters", "Arial", 19);
        this.helloLabel.x = size.width / 2;
        this.helloLabel.y = 0;
        this.addChild(this.helloLabel, 5);

        this.sprite = cc.Sprite.create(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 0.5,
            rotation: 180
        });
        this.addChild(this.sprite, 0);

        var rotateToA = cc.RotateTo.create(2, 0);
        var scaleToA = cc.ScaleTo.create(2, 6, 6);
        var tintToA = cc.TintTo.create(4, 30, 30, 70);

        this.sprite.runAction(tintToA);
        this.sprite.runAction(cc.Sequence.create(rotateToA, scaleToA));
        this.helloLabel.runAction(cc.Spawn.create(cc.MoveBy.create(2.5, cc.p(0, size.height - 40)),cc.TintTo.create(2.5,255,125,0)));
	},
	
	loadImages: function() {
		// Load sprite frames to frame cache, add texture node
        cc.spriteFrameCache.addSpriteFrames(res.letters_plist);
        var lettersTexture = cc.textureCache.addImage(res.letters_png),
        	lettersImages  = cc.SpriteBatchNode.create(lettersTexture);
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
        cc.eventManager.addListener(cc.EventListener.create({
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
        }), this);
    } else {
        cc.log("TOUCH_ALL_AT_ONCE is not supported");
    }
       
	/*
	 * KEYBOARD EVENTS
	 */ 
    
    if( 'keyboard' in cc.sys.capabilities ) {
        cc.eventManager.addListener({
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
    } else {
         cc.log("KEYBOARD is not supported");
    }

    },

	buildTile: function(p) {
		
		// select a random tile type
		var tileBoxes = TILE_BOXES[Math.floor(Math.random()*TILE_BOXES.length)];
		
		//tileBoxes = TILE_BOXES[Math.floor(Math.random()*4)+0];

		// create sprite for tile and set is size 0, we only use its position and rotation
		var tileSprite = cc.Sprite.create(res.letters_png,cc.rect(0,0,0,0)),
			batch = this.getChildByTag(TAG_SPRITE_MANAGER);
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
        	rotation: 270,
        	direction: 0,  // 0, -1, 1 
        	rotating : false,
        	action: null
        });
        
        tileSprite.setRotation(270);
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
    	 * snap tile to column
    	 */
    	var snapToColumn = function(t, lp) {
    		
    		var boxPos = t.rotatedBoxes[0];
    			closest = Math.round((lp.x+boxPos.x+BS/2-BOXES_X_OFFSET)/BS)*BS+BOXES_X_OFFSET-boxPos.x-BS/2;    		

    		if( lp.x != closest ) {
    			if(Math.abs(closest-lp.x) >= SNAP_SPEED) lp.x += SNAP_SPEED * Math.sign(closest - lp.x);
    			else lp.x = closest;
    			t.sprite.setPosition(lp);
    		}
    	};
    	
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
    				fixTile(t, lp);
    				return true;
    			}

    			// check for left and right walls or tiles in the way
    			if( t.direction && t.action ) {
    				if( self.boxes[brc.row][brc.col + t.direction] || 
    					brc.col + t.direction < 0 || 
    					brc.col + t.direction >= BOXES_PER_ROW ) {
    					
    					cc.log("Stop-Action: "+t.action);
    					t.sprite.stopAction(t.action);
    					t.action = null;
    					return false;
    				}
    			}
    			
    		}

    		return false;
    	};
    	
    	var checkRotation = function(t, lp) {
    		
    		var b = t.rotatedBoxes,
    			minCol = 0,
    			maxCol = 0;
    		
    		for( var i=0 ; i<b.length ; i++) {
        		var brc = getRowCol(b[i], lp);
        		
        		minCol = Math.min(minCol, brc.col);
        		maxCol = Math.max(maxCol, brc.col);
        		
        		if( self.boxes[brc.row][brc.col] ) return "collision";
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
    			b = t.rotatedBoxes;
    		
    		for( var i=0 ; i<b.length ; i++) {
        		// create a new sprite from the old child sprites
    			var sprite = t.sprite.children[i],
    				newSprite = cc.Sprite.create(sprite.getTexture(), sprite.getTextureRect());

    			// Insert into boxes array
				var brc = getRowCol(b[i], lp);
    			
    			newSprite.setPosition(BOXES_X_OFFSET + brc.col*BS + BS/2 , BOXES_Y_OFFSET + brc.row*BS + BS/2);
    	        batch.addChild(newSprite);

    			self.boxes[brc.row][brc.col] = newSprite; 			
    		}
    		
    		batch.removeChild(t.sprite);
    		delete t;
    		
    		checkForAndRemoveCompleteRows();
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

                self.buildTile(cc.p(Math.random()*(BOXES_PER_ROW-4)*BS+BOXES_X_OFFSET+2*BS, size.height));        	    			
    		} 
    	} else {
    		self.isSwiping = false;
    	}
    	// if there is no tile flying, build a new one
        var tilesFlying = self.tiles.filter(function(value) { return value !== undefined }).length;
        if( !tilesFlying ) {
            self.buildTile(cc.p(Math.random()*(BOXES_PER_ROW-4)*BS+BOXES_X_OFFSET+2*BS, size.height));        	
        }

    	/*
    	 * Main loop to move tiles
    	 */
    	for( tile in self.tiles ) {
    		var t = self.tiles[tile],
    			lp = t.sprite.getPosition();

    		/*
    		 * Move tile left and right
    		 */
    		if( true || tile == self.tiles.length-1 ) { // move only the last tile
    			
	    		if( t.direction === 0 ) {
	    			if( self.isSwipeLeft ) {
	    				var t1 = t;
	    				t.direction = -1;
	        			cc.log("Starting action, shifting tile left: lp.y="+lp.y+", BS="+BS);
	    				t.action = t.sprite.runAction(cc.sequence( 
	    					cc.moveTo(MOVE_SPEED,cc.p(lp.x-BS,lp.y)),
	    					cc.callFunc(function() {
	    						t1.direction = 0;
	    						t.action = null;
	    					}, self)
	    				));
	    			} else if( self.isSwipeRight ) {
	    				var t1 = t;
	    				t.direction = 1;
	        			cc.log("Starting action, shifting tile right: lp.y="+lp.y+", BS="+BS);
	    				t.action = t.sprite.runAction(cc.sequence( 
	    					cc.moveTo(MOVE_SPEED,cc.p(lp.x+BS,lp.y)),
	    					cc.callFunc(function() {
	    						t1.direction = 0;
	    						t.action = null;
	    					}, self)
	    				));
	    			}     			
	    		} else if( !self.isSwipeLeft && !self.isSwipeRight ) {
	    			t.direction = 0;
	    		}
	    		
	    		if( !t.rotating ) {
	    			if( self.isSwipeUp && !(self.isSwipeLeft || self.isSwipeRight) ) {
	    				var oldRotation = t.rotation;
	    				t.rotation = (t.rotation + 90)%360;
	    				self.rotateBoxes(t);
	    				
	    				var check = checkRotation(t, lp);
	    				
	    				if( check != "collision" ) {
	    					var t1 = t,
	    						offset = parseInt(check) || 0;
	    					
	    					if(offset != 0) {
	    	    				t.direction = Math.sign(check);
	    	    				t.sprite.runAction(cc.sequence( 
	    	    					cc.moveBy(MOVE_SPEED/2,cc.p(-offset*BS,0)),
	    	    					cc.callFunc(function() {
	    	    						t1.direction = 0;
	    	    					}, self)
	    	    				));
	    					}
	    					
	        				t.rotating = true;
	            			cc.log("Starting action, rotating tile!");
	        				t.sprite.runAction(cc.sequence( 
	        					cc.rotateTo(MOVE_SPEED*2,t.rotation),
	        					cc.callFunc(function() {
	                    			cc.log("Ending rotating tile!");
	        						t1.rotating = false;
	        					}, self)
	        				));
	    				} else {
	        				t.rotation = oldRotation;
	        				self.rotateBoxes(t);    					
	    				}
	    			}
	    		}
	    		
	    		var fallingSpeed = FALLING_SPEED;
    		} 
    		
    		if(tile != self.tiles.length-1) {
    			var fallingSpeed = FALLING_SPEED * 8;
    		}
	    		
    		snapToColumn(t, lp);
    		
    		// let tile fall down
    		lp.y -= fallingSpeed;
    		
    		if( checkForCollision(t, lp) ) {
    			// tile landed ...
    			delete self.tiles[tile];
    		} else {
        		
        		t.sprite.setPosition(lp);    			
    		};
    	}
    }
});

var MutrixScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MutrixLayer();
        this.addChild(layer);
    }
});

