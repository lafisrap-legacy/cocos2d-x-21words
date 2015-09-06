$42.MUSIC_VOLUME_GRANULARITY = 10;

////////////////////////////////////////////////
// Music for easy title
$42.MUSIC_TITLE_EASY = {
    intro: res.title_easy_intro_mp3,
    introLength:    11.386000,
    loop:  res.title_easy_loop_mp3,
    loopLength:     38.124000,
    fadeOutDelay:   0,
    fadeOutTime:    4000
}

////////////////////////////////////////////////
// Music for level 1
$42.MUSIC_RED_HILLS = {
    background: {
        intro:          null,
        loop:           null
    },
    levelWords:     { 
        audio: res.red_hills_level_words_mp3,
        delay: 1500,
    },
    levelNr:        { 
        audio: res.red_hills_level_nr_mp3, 
        delay: 4500
    },
    setTile:        { 
        audio: res.red_hills_set_tile_mp3, 
        playOnBeat: 0.5
    },
    swipe:          { 
        audio: [],
        intervalTime: 450
    },
    rotate:         { 
        audio: [res.red_hills_rotate_1_mp3, res.red_hills_rotate_2_mp3, res.red_hills_rotate_3_mp3],
        minInterval: 000 
    },
    fixTile:        { audio: res.red_hills_fix_tile_1_mp3 }, 
    selection:      { audio: res.red_hills_selection_mp3 },
    fullWord:       { audio: res.red_hills_full_word_mp3 },
    presentWord:    { 
        audio: res.blue_mountains_present_word_mp3,
        intervalTime: 3000,
        delayTime: 500 
    },
    lastWord:       { audio: res.red_hills_last_word_mp3 },
    deleteRow:      { audio: res.red_hills_delete_row_mp3 },
    final:          { audio: res.red_hills_final_mp3 },
};


////////////////////////////////////////////////
// Music for level 2
$42.MUSIC_FLAMES = {
    background: {
        intro: res.flames_intro_mp3,
        introLength:    85.140000,
        introTimes:     100,
        introMeasure:   1,
        loop:           res.flames_loop_mp3,
        loopLength:     89.136000,
        loopTimes:      24,
        loopMeasure:    4
    },
    levelWords:     { 
        audio: res.flames_level_words_mp3,
        delay: 1500,
    },
    levelNr:        { 
        audio: res.flames_level_nr_mp3, 
        delay: 4500
    },
    setTile:        { 
        audio: res.flames_set_tile_mp3,
        playOnBeat: 0.5
    },
    swipe:          { 
        audio: [], 
        intervalTime: 450
    },
    rotate:         { 
        audio: [res.flames_rotate_1_mp3, res.flames_rotate_2_mp3, res.flames_rotate_3_mp3],
        minInterval: 0 
    },
    fixTile:        { audio: res.flames_fix_tile_1_mp3 }, 
    selection:      { audio: res.flames_selection_mp3 },
    fullWord:       { audio: res.flames_full_word_mp3 },
    presentWord:    { 
        audio: res.blue_mountains_present_word_mp3,
        intervalTime: 3000, 
        delayTime: 500 
    },
    lastWord:       { audio: res.flames_last_word_mp3 },
    deleteRow:      { audio: res.flames_delete_row_mp3 },
    final:          { audio: res.flames_final_mp3 },
};

////////////////////////////////////////////////
// Music for level 6
$42.MUSIC_INKA_TEMPLE = {
    background: {
        intro:  null, 
        loop:  [res.inka_temple_intro_a_mp3,res.inka_temple_intro_b_mp3,res.inka_temple_intro_c_mp3,res.inka_temple_intro_d_mp3,res.inka_temple_intro_e_mp3,res.inka_temple_intro_f_mp3,res.inka_temple_intro_g_mp3,res.inka_temple_intro_h_mp3],
        loopLength:     [15.595102, 11.650612, 11.650612, 11.075918, 13.635918, 13.635918, 12.773878, 12.773878],
        fadeOutTime:    50
    },
    levelWords:     { 
        audio: null 
    },
    levelNr:        { 
        audio: null 
    },
    setTile:        { 
        audio: [res.inka_temple_set_tile_a_mp3, res.inka_temple_set_tile_b_mp3] 
    },
    swipe:          { 
        audio: [res.inka_temple_swipe_a_mp3, res.inka_temple_swipe_b_mp3],
        intervalTime: 450
    },
    rotate:         { 
        audio: [res.inka_temple_rotate_1_mp3, res.inka_temple_rotate_2_mp3, res.inka_temple_rotate_3_mp3],
        minInterval: 0
    },
    fixTile:        { 
        audio: [res.inka_temple_fix_tile_a_mp3, res.inka_temple_fix_tile_b_mp3, res.inka_temple_fix_tile_c_mp3] 
    }, 
    selection:      { audio: res.inka_temple_selection_mp3 },
    fullWord:       { audio: res.inka_temple_full_word_mp3 },
    presentWord:    { 
        audio: res.inka_temple_present_word_mp3,
        delayTime: 500 
    },
    lastWord:       { audio: res.inka_temple_last_word_mp3 },
    nextWord:       { audio: res.inka_temple_next_word_mp3 }, 
    final:          { audio: res.inka_temple_final_mp3 },
    deleteRow:      null,
};

////////////////////////////////////////////////
// Music for level 7
$42.MUSIC_BLUE_MOUNTAINS = {
    background: {
        intro: res.blue_mountains_intro_mp3,
        introLength:    90.592653,
        introTimes:     24,
        introMeasure:   4,
        loop:  res.blue_mountains_loop_mp3,
        loopLength:     90.592653,
        loopTimes:      24,
        loopMeasure:    4
    },
    levelWords:     { 
        audio: res.blue_mountains_level_words_mp3,
        delay: 0,
    },
    levelNr:        { 
        audio: res.blue_mountains_level_nr_mp3, 
        delay: 3000
    },
    setTile:        { 
        audio: res.blue_mountains_set_tile_mp3, 
        playOnBeat: 0.5
    },
    swipe:          { 
        audio: res.blue_mountains_swipe_mp3,
        dontStop: true
    },
    rotate:         { 
        audio: [res.blue_mountains_rotate_1_mp3, res.blue_mountains_rotate_2_mp3, res.blue_mountains_rotate_3_mp3],
        minInterval: 0
    },
    fixTile:        { 
        audio: [res.blue_mountains_fix_tile_1_mp3, res.blue_mountains_fix_tile_1_mp3, res.blue_mountains_fix_tile_2_mp3], 
        playOnBeat: 0.25
    }, 
    selection:      { audio: res.blue_mountains_selection_mp3 },
    fullWord:       { audio: res.blue_mountains_full_word_mp3 },
    presentWord:    { 
        audio: res.blue_mountains_present_word_mp3,
        intervalTime: 3000, 
        delayTime: 500
    },
    lastWord:       { audio: res.blue_mountains_last_word_mp3 },
    deleteRow:      { audio: res.blue_mountains_delete_row_mp3 },
    final:          { audio: res.blue_mountains_final_mp3 },
};

var _MUSIC_MODULE = function(layer) {
    var musicPlaying = null;

    layer.playEffect = function playEffect(effect) {
        var mp = musicPlaying,
            time = new Date().getTime();

        if( !effect || !effect.audio || effect.audio.length === 0 ) return;
        if( effect.minInterval ) {
            if( time - (effect.lastPlay || 0) < effect.minInterval ) return;
        }

        //cc.log("Now ("+time+") playing effect: "+effect.audio);
        
        if( typeof effect.audio === "string" ) effect.audio = [effect.audio];
        if( effect.audioSlot === undefined ) effect.audioSlot = 0;
        else effect.audioSlot = ++effect.audioSlot%effect.audio.length;

        var play = function() {
            var as = effect.audioSlot;
            if( effect.intervalTime && !effect.interval ) {
                effect.id = cc.audioEngine.playEffect(effect.audio[as]);
                effect.id.setVolume($42.EFFECTS_VOLUME);
                if( $42.msg2 ) $42.msg2.setString("Starting interval: "+effect.audio[as]);
                effect.interval = setInterval(function() {
                    if( effect.intervalIsEnding ) {
                        //cc.log("Ending interval of "+effect.audio[as]);
                        if( $42.msg2 ) $42.msg2.setString("Ending interval: "+effect.audio[as]);
                        clearInterval(effect.interval);
                        effect.interval = null;
                        effect.intervalIsEnding = false;
                    } else {
                        //cc.log("Playing in interval: "+effect.audio[as]);
                        if( $42.msg2 ) $42.msg2.setString("Playing in interval: "+effect.audio[as]);
                        playEffect(effect);
                    }
                }, effect.intervalTime);
            } else {
                effect.id = cc.audioEngine.playEffect(effect.audio[as]);
                effect.id.setVolume($42.EFFECTS_VOLUME);
                if( $42.msg2 ) $42.msg2.setString("Now playing: "+effect.audio[as]);
            }

            effect.lastPlay = time;
        };

        if( effect.delayTime ) setTimeout(play, effect.delayTime );
        else play();
    };

    layer.stopEffect = function(effect) {
        if( !effect || !effect.audio ) return;

        if( effect.interval ) {
            if( !effect.intervalIsEnding ) {
                effect.intervalIsEnding = true;
                if( effect.end ) {
                    var span = new Date().getTime() - effect.lastPlay;
                    setTimeout(function() {
                        //cc.log("Playing end of interval: "+effect.end);
    	                if( $42.msg2 ) $42.msg2.setString("Playing effect end: "+effect.end);
                        layer.playEffect({audio: effect.end});
                        effect.id.setVolume($42.EFFECTS_VOLUME);
                    }, effect.endDelay-span || 0 );
                }
            }
        } else if(!effect.dontStop ) {
            cc.audioEngine.stopEffect(effect.id);
    	    if( $42.msg2 ) $42.msg2.setString("Stopping effect:"+effect.audio[0]);
            effect.id = null;
        }
    };

    layer.callFuncOnNextBeat = function(cb, mp, granularity, cnt) {
        var mp = mp || musicPlaying,
            time = new Date().getTime();
        if( mp ) {
            var frame  = mp.loopLength? mp.loopLength*1000 / mp.loopTimes / mp.loopMeasure * granularity : 0;
            
            if( frame ) {
                var span = time - (mp.startTime || time),
                    frames = Math.floor(span/frame),
                    offset = span - frames * frame;

                //cc.log("Waiting for next beat for "+(frame * (cnt || 1) - offset)+" ms. ("+offset+", "+frames+", "+frame+")");
                setTimeout(cb, frame * (cnt || 1) - offset);
            } else {
                cb();
            }
        }
    };

    layer.playInCount = function(effect) {
        var mp = musicPlaying;

        if( typeof effect.audio === "string" ) effect.audio = [effect.audio];
        if( effect.audioSlot === undefined ) effect.audioSlot = 0;
        else effect.audioSlot = ++effect.audioSlot%effect.audio.length;

        var as = effect.audioSlot, 
            span = new Date().getTime() - mp.startTime,
            shift = effect.shift*mp.beatLength + (effect.shift<0? mp.beatLength : 0);

        setTimeout( function() {
            setInterval(function() {
                cc.audioEngine.playEffect(effect.audio[as]);
            }, mp.beatLength);
        }, shift);
    };

    layer.playBackgroundMusic = function(mp, afterNBeats) {
        var time = new Date().getTime();

        if( !mp ) return;

        //cc.log("Playing background music of '"+mp.intro+"' and '"+mp.loop+"'.");
        if( mp.intro ) {
            mp.startTime   = new Date().getTime(); 
            cc.assert(mp.introLength && mp.introTimes && mp.introMeasure, "");
            mp.beatLength = mp.loopLength? mp.loopLength*1000 / mp.loopTimes / mp.loopMeasure : 0;
            cc.audioEngine.playMusic(mp.intro, false);
            cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);
    	    if( $42.msg1 ) $42.msg1.setString("Now playing background intro '"+mp.intro+"'");

            musicPlaying = mp;
        }

        if( mp.loop ) {
            if( typeof mp.loop === "string" ) mp.loop = [mp.loop];
                mp.loopSlot = 0;
            
            if( mp.loop[0].length ) {
                mp.timeout = setTimeout(function() {
                    mp.startTime   = new Date().getTime();
                    mp.beatLength = mp.loopLength*1000 / mp.loopTimes / mp.loopMeasure;
                    if( mp.loop.length === 1 ) {
                        cc.audioEngine.playMusic(mp.loop[0], true);
                        if( $42.msg1 ) $42.msg1.setString("Now playing background loop '"+mp.loop[0]+"'");
                    } else {
                        cc.audioEngine.playMusic(mp.loop[0], false);
                        if( $42.msg1 ) $42.msg1.setString("Now playing background loop '"+mp.loop[0]+"'");
                        setTimeout(layer.playNextMusicSlot, mp.loopLength[0] * 1000);
                    }
                    
                }, (mp.introLength || 0)*1000 );

                musicPlaying = mp;
            }
        }
    };

    layer.playNextMusicSlot = function(fadeOut) {

        var mp = musicPlaying;
        if( !mp || !mp.loopSlot && !mp.loopSlot === 0 ) return;

        var playSlot = function() {
            mp.loopSlot = ++mp.loopSlot % mp.loop.length;
            cc.audioEngine.playMusic(mp.loop[mp.loopSlot], false);
            cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);
            if( $42.msg1 ) $42.msg1.setString("Now playing loop '"+mp.loop[mp.loopSlot]+"'");
            if( mp.timeout ) clearTimeout( mp.timeout );
            mp.timeout = setTimeout(layer.playNextMusicSlot, mp.loopLength[mp.loopSlot] * 1000);
        };

        if( fadeOut && mp.fadeOutTime ) {
            layer.fadeOutBackgroundMusic(mp.fadeOutTime, false, playSlot);
        } else {
            playSlot();
        }
    };

    layer.stopBackgroundMusic = function(time) {
        var mp = musicPlaying;

        if( mp ) {
            if( time ) layer.fadeOutBackgroundMusic(time);
            else cc.audioEngine.stopMusic();
        
            if( mp.timeout ) clearTimeout(mp.timeout);
            mp.timeout = null;
            mp.startTime = null;
            mp.loopSlot = null;
            musicPlaying = null;
    	    if( $42.msg1 ) $42.msg1.setString("Background music stopped!");
        }
    };

    var fadeBackgroundMusic = function(time, direction, dontStop, cb) {
        var volume = cc.audioEngine.getMusicVolume(),
            vg = $42.MUSIC_VOLUME_GRANULARITY,
            steps = Math.ceil(time / vg),
            step = volume / steps * direction;

        cc.assert(direction === -1 || direction === 1, "Fade direction must be either 1 or -1.");

        var interval = setInterval(function() {
            volume += step;
            if( direction === -1 && volume < 0 || direction === 1 && volume > $42.MUSIC_VOLUME ) {
                if( !dontStop ) cc.audioEngine.stopMusic();
    	        if( $42.msg1 ) $42.msg1.setString("Background music stopped");
                clearInterval(interval);
                if( typeof cb === "function" ) cb();
            } else {
                cc.audioEngine.setMusicVolume(volume);
    	        if( $42.msg1 ) $42.msg1.setString("Background music is fading out ... volume "+Math.floor(volume*100)/100);
            }
        }, $42.MUSIC_VOLUME_GRANULARITY);
    };

    layer.fadeOutBackgroundMusic = function(time, dontStop, cb) {
        fadeBackgroundMusic(time, -1, dontStop, cb);
    };

    layer.fadeInBackgroundMusic = function(time, dontStop) {
        fadeBackgroundMusic(time, 1, dontStop, cb);
    }
}

