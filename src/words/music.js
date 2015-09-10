$42.MUSIC_VOLUME_GRANULARITY = 10;

////////////////////////////////////////////////
// Music for easy title
$42.MUSIC_TITLE_EASY = {
    intro: res.title_easy_intro_mp3,
    introLength:    44.309000,
    loop:  res.title_easy_loop_mp3,
    loopLength:     38.066000,
    fadeOutDelay:   0,
    fadeOutTime:    6000
}

////////////////////////////////////////////////
// Music for level 1
$42.MUSIC_RED_HILLS = {
    background: {
        intro:          res.red_hills_intro_mp3,
        introLength:    2.142000,
        introTimes:     1,
        introMeasure:   4,
        loop:           res.red_hills_loop_mp3,
        loopLength:     22.232000,
        loopTimes:      11.375,
        loopMeasure:    4,
        nextSetOn:      [10000,10000,10000]
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
        playOnBeat: 0,
        playAfterBeats: 1
    },
    swipe:          { 
        audioSet: [[res.red_hills_swipe_1_mp3, res.red_hills_swipe_2_mp3, res.red_hills_swipe_3_mp3],
                   [res.inka_temple_swipe_a_mp3, res.inka_temple_swipe_b_mp3],
                   [res.blue_mountains_swipe_mp3]],
        nextSetOn: "setTile",
        intervalTime: 450,
        minInterval: 200,
        stayWithSound: true
    },
    rotate:         { 
        audioSet: [[res.red_hills_rotate_1_mp3, res.red_hills_rotate_2_mp3, res.red_hills_rotate_3_mp3],
                   [res.flames_rotate_1_mp3, res.flames_rotate_2_mp3, res.flames_rotate_3_mp3],
                   [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3]],
        nextSetOn: "time",
        dontStop: true
    },
    fixTile:        { 
        audio: res.red_hills_fix_tile_1_mp3, 
        playOnBeat: 0,
        playAfterBeats: 0 
    }, 
    selection:      { audio: res.red_hills_selection_mp3 },
    fullWord:       { audio: res.red_hills_full_word_mp3 },
    presentWord:    { 
        audio: res.blue_mountains_present_word_mp3,
        intervalTime: 3000,
        delayTime: 500 
    },
    lastWord:       { audio: res.red_hills_last_word_mp3 },
    deleteRow:      { audio: res.red_hills_delete_row_mp3 },
    deleteLastRows: { audio: res.red_hills_delete_last_rows_mp3 },
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
        playOnBeat: 0,
        playAfterBeats: 0.5
    },
    swipe:          { 
        audio: null, 
        intervalTime: 450
    },
    rotate:         { 
        audio: [res.flames_rotate_1_mp3, res.flames_rotate_2_mp3, res.flames_rotate_3_mp3],
        minInterval: 0 
    },
    fixTile:        { 
        audio: res.flames_fix_tile_1_mp3, 
        playOnBeat: 0,
        playAfterBeats: 0 
    }, 
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
// Music for level 3
$42.TEST = {
    background: {
        loop:           res.test_background_loop_mp3,
        loopLength:     18.461000,
        loopTimes:      4,
        loopMeasure:    1,
        playOnBeat: 1,
        playAfterBeats: 1,
        nextSetOn:      [4615.15,4615.15,4615.15,4615.15],
        delay: 1000
    },
    levelWords:     { 
        audio: res.red_hills_level_words_mp3,
        delay: 1500,
    },
    levelNr:        { 
        audio: res.red_hills_level_nr_mp3, 
        delay: 4500
    },
    setTile:         { 
        audioSet: [[res.test_trumpet_1_mp3],
                   [res.test_trumpet_2_mp3],
                   [res.test_trumpet_3_mp3],
                   [res.test_trumpet_4_mp3]],
        nextSetOn: "time",
        playOnBeat: 0.5,
        playAfterBeats: 1
    },
    swipe:          { 
         audioSet: [[res.test_horns_down_1_mp3],
                   [res.test_horns_down_2_mp3],
                   [res.test_horns_down_3_mp3],
                   [res.test_horns_down_4_mp3]],
        nextSetOn: "time",
        dontStop: true,
        intervalTime: 450
    },
    rotate:         { 
        audio: [res.flames_rotate_1_mp3, res.flames_rotate_2_mp3, res.flames_rotate_3_mp3],
        minInterval: 0 
    },
    fixTile:        { 
        audioSet: [[res.test_trombone_1_mp3],
                   [res.test_trombone_2_mp3],
                   [res.test_trombone_3_mp3],
                   [res.test_trombone_4_mp3]],
        nextSetOn: "time",
        playOnBeat: 0.25,
        playAfterBeats: 1
    }, 
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
// Music for level 5
$42.MUSIC_BLUE_QUADRAT = {
    background: {
        //intro: res.blue_quadrat_intro_mp3,
        //introLength:    85.140000,
        //introTimes:     100,
        //introMeasure:   1,
        loop:           res.blue_quadrat_loop_mp3,
        loopLength:     38.064000,
        //loopTimes:      100,
        //loopMeasure:    1
        delay: 1000
    },
    levelWords:     { 
        audio: res.blue_quadrat_level_words_mp3,
        delay: 1500,
    },
    levelNr:        { 
        audio: res.blue_quadrat_level_nr_mp3, 
        delay: 4500
    },
    setTile:        { 
        audio: [res.blue_quadrat_set_tile_1_mp3, res.blue_quadrat_set_tile_2_mp3, res.blue_quadrat_set_tile_3_mp3],
        playOnBeat: 0,
        playAfterBeats: 0
    },
    swipe:          { 
        audio: null,
        //audio: [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_3_mp3],
        intervalTime: 450
    },
    rotate:         { 
        audio: [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
        minInterval: 0 
    },
    fixTile:        { 
        audio: [res.blue_quadrat_fix_tile_1_mp3, res.blue_quadrat_fix_tile_2_mp3, res.blue_quadrat_fix_tile_3_mp3], 
        playOnBeat: 0,
        playAfterBeats: 0 
    }, 
    selection:      { audio: [res.blue_quadrat_selection_1_mp3, res.blue_quadrat_selection_2_mp3, res.blue_quadrat_selection_3_mp3], 
    },
    fullWord:       { audio: [res.blue_quadrat_full_word_1_mp3, res.blue_quadrat_full_word_2_mp3], 
    },
    presentWord:    { 
        audio: res.blue_mountains_present_word_mp3,
        intervalTime: 3000, 
        delayTime: 500 
    },
    lastWord:       { audio: res.blue_quadrat_last_word_mp3 },
    deleteRow:      { audio: res.blue_quadrat_delete_row_mp3 },
    final:          { audio: res.blue_quadrat_final_mp3 },
    deleteLastRows: { audio: res.blue_quadrat_delete_last_rows_mp3 },
};

////////////////////////////////////////////////
// Music for level 6
$42.MUSIC_INKA_TEMPLE = {
    background: {
        intro:  null, 
        loop:  [res.inka_temple_intro_a_mp3,res.inka_temple_intro_b_mp3,res.inka_temple_intro_c_mp3,res.inka_temple_intro_d_mp3,res.inka_temple_intro_e_mp3,res.inka_temple_intro_f_mp3,res.inka_temple_intro_g_mp3,res.inka_temple_intro_h_mp3],
        loopLength:     [15.595102, 11.650612, 11.650612, 11.075918, 13.635918, 13.635918, 12.773878, 12.773878],
        loopFrame: 550,
        fadeOutTime:    50,
        delay: 1000
    },
    levelWords:     { 
        audio: res.inka_temple_level_words_mp3
    },
    levelNr:        { 
        audio: res.inka_temple_level_nr_mp3 
    },
    setTile:        { 
        audio: [res.inka_temple_set_tile_a_mp3, res.inka_temple_set_tile_b_mp3], 
        playOnBeat: 0,
        playAfterBeats: 1
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
        audio: [res.inka_temple_fix_tile_a_mp3, res.inka_temple_fix_tile_b_mp3, res.inka_temple_fix_tile_c_mp3], 
        playOnBeat: 0,
        playAfterBeats: 0  
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
    deleteRow:      { audio: res.inka_temple_delete_row_mp3 },
    deleteLastRows: { audio: res.inka_temple_delete_last_rows_mp3 },
};

////////////////////////////////////////////////
// Music for level 7
$42.MUSIC_BLUE_MOUNTAINS = {
    background: {
        intro: res.blue_mountains_intro_mp3,
        introLength:    90.592653,
        introTimes:     48,
        introMeasure:   4,
        loop:  res.blue_mountains_loop_mp3,
        loopLength:     90.592653,
        loopTimes:      48,
        loopMeasure:    4,
        playOnBeat: 0.5,
        playAfterBeats: 1,
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
        playAfterBeats: 2,
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
        playOnBeat: 0.5,
        playAfterBeats: 1 
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
    deleteLastRows: { audio: res.blue_mountains_delete_last_rows_mp3 },
    final:          { audio: res.blue_mountains_final_mp3 },
};

var _MUSIC_MODULE = function(layer) {
    var musicPlaying = null;

    layer.playEffect = function playEffect(effect, repeat) {
        var mp = musicPlaying,
            time = new Date().getTime();

        if( !effect || !effect.audio && !effect.audioSet ) return;

        cc.log("Now ("+time+") playing effect "+(repeat?" with":" without")+" repeat");
        
        if( typeof effect.audio === "string" ) effect.audio = [effect.audio];
        if( effect.audioSet ) {
            if( !effect.currentSet ) effect.currentSet = 0;
            effect.audio = effect.audioSet[effect.currentSet];
        }
        if( effect.currentSlot === undefined ) effect.currentSlot = 0;
        else if( !repeat || !effect.stayWithSound ) effect.currentSlot = ++effect.currentSlot%effect.audio.length;

        var play = function() {
            var cs = effect.currentSlot;
            if( effect.intervalTime && !effect.interval ) {
                if( repeat || !effect.minInterval || time - (effect.lastPlay || 0) >= effect.minInterval ) {
                    effect.id = cc.audioEngine.playEffect(effect.audio[cs]);
                }
                //effect.id.setVolume($42.EFFECTS_VOLUME);
                if( $42.msg2 ) $42.msg2.setString("Starting interval: "+effect.audio[cs]);
                effect.interval = setInterval(function() {
                    if( effect.intervalIsEnding ) {
                        //cc.log("Ending interval of "+effect.audio[cs]);
                        if( $42.msg2 ) $42.msg2.setString("Ending interval: "+effect.audio[cs]);
                        clearInterval(effect.interval);
                        effect.interval = null;
                        effect.intervalIsEnding = false;
                    } else {
                        //cc.log("Playing in interval: "+effect.audio[cs]);
                        if( $42.msg2 ) $42.msg2.setString("Playing in interval: "+effect.audio[cs]);
                        playEffect(effect, true);
                    }
                }, effect.intervalTime);
            } else {
                if( !effect.minInterval || time - (effect.lastPlay || 0) >= effect.minInterval ) {
                    effect.id = cc.audioEngine.playEffect(effect.audio[cs]);
                }
                //effect.id.setVolume($42.EFFECTS_VOLUME);
                if( $42.msg2 ) $42.msg2.setString("Now playing: "+effect.audio[cs]);
            }

            effect.lastPlay = time;
        };

        setTimeout(play, effect.delayTime || 0);
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
                        //effect.id.setVolume($42.EFFECTS_VOLUME);
                    }, effect.endDelay-span || 0 );
                }
            }
        } else if(!effect.dontStop ) {
            cc.audioEngine.stopEffect(effect.id);
    	    if( $42.msg2 ) $42.msg2.setString("Stopping effect:"+effect.audio[0]);
            effect.id = null;
        }
    };

    layer.changeAudioSet = function(event) {

        var music = $42.LEVEL_DEVS[$42.SCENE.mainLayer._gameMode][$42.currentLevel-1].music;
        if( !music ) return;

        for (var key in music) {
            if (music.hasOwnProperty(key)) {
                var effect = music[key];

                if( effect.nextSetOn === event ) {
                    if( !effect.currentSet ) effect.currentSet = 0;
                    effect.currentSet = ++effect.currentSet%effect.audioSet.length;
                    effect.currentSlot = 0;
                }
            }
        }
    };

    layer.callFuncOnNextBeat = function(cb, sound) {
        var mp = musicPlaying || null,
            time = new Date().getTime();
        if( mp && mp.loop ) {
            var frame  = mp.loopFrame || (mp.loopLength? mp.loopLength*1000 / mp.loopTimes / mp.loopMeasure * (sound.playOnBeat || 1) : 0);
            
            if( frame ) {
                var span = time - (mp.startTime || time),
                    frames = Math.floor(span/frame),
                    offset = span - frames * frame;

                //cc.log("Waiting for next beat for "+(frame * (cnt || 1) - offset)+" ms. ("+offset+", "+frames+", "+frame+")");
                setTimeout(cb, frame * (sound.playAfterBeats || 0) - (sound.playOnBeat? offset : 0));
            } else {
                cb();
            }
        } else {
            cb();
        }
    };

    layer.playBackgroundMusic = function(mp) {
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
        }

        if( mp.loop ) {
            if( typeof mp.loop === "string" ) mp.loop = [mp.loop];
            mp.loopSlot = 0;
            
            if( mp.loop[0].length ) {
                mp.timeout = setTimeout(function() {
                    mp.timeout = null;
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
            }
        }
        
        // timeouts for sets
        if( mp.nextSetOn ) {
            mp.timeoutSet = setTimeout(function() {
                mp.timeoutSet = null;
                mp.nextSetOnSlot = 0;
                (function nextTimeout() {
                    mp.nextSetOnTimeout = setTimeout(function() {
                        layer.changeAudioSet("time");
                        mp.nextSetOnSlot = ++mp.nextSetOnSlot%mp.nextSetOn.length;
                        nextTimeout();
                    }, mp.nextSetOn[mp.nextSetOnSlot]);
                })();
            }, (mp.introLength || 0)*1000 );
        } 
        
        musicPlaying = mp;
    };

    layer.playNextMusicSlot = function(fadeOut) {

        var mp = musicPlaying;
        if( !mp || !mp.loop || mp.loop.length <= 1 ) return;

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
            if( mp.timeoutSet ) clearTimeout(mp.timeoutSet);
            if( mp.nextSetOnTimeout ) clearTimeout(mp.nextSetOnTimeout); 
            mp.timeout = mp.timeoutSet = mp.nextSetOnTimeout = null;
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

