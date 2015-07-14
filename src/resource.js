var res = {
    tiles_png : "res/images/tiles.png",
    tiles_plist : 'res/images/tiles.plist',
    marker_png : "res/images/marker.png",
    marker_plist : 'res/images/marker.plist',
    letters_png : "res/images/letters/letters.png",
    letters_plist : 'res/images/letters/letters.plist',
    title_png : "res/images/title/title.png",
	background01_png : "res/images/backgrounds/level01.png",
	background02_png : "res/images/backgrounds/level02.png",
	background03_png : "res/images/backgrounds/level03.png",
	background04_png : "res/images/backgrounds/level04.png",
	background05_png : "res/images/backgrounds/level05.png",
	background06_png : "res/images/backgrounds/level06.png",
	background07_png : "res/images/backgrounds/level07.png",
	background08_png : "res/images/backgrounds/level08.png",
	background09_png : "res/images/backgrounds/level09.png",
	background10_png : "res/images/backgrounds/level10.png",
	empty_png : "res/empty.png",
	amtype24_png : "res/fonts/amtype24.png",
	amtype72_png : "res/fonts/amtype72.png",

	// sounds
	plopp_mp3 : "res/sounds/plopp.mp3",
	pling_mp3 : "res/sounds/pling.mp3",
	ritsch_mp3 : "res/sounds/ritsch.mp3",

	// fonts
	amtype24_fnt : "res/fonts/amtype24.fnt",
	amtype72_fnt : "res/fonts/amtype72.fnt",
	american_typewriter_ttf: "res/fonts/American Typewriter.ttf",
	//exo_bold_ttf: {type:"font", name:"Exo", srcs:["res/fonts/Exo-Bold.ttf"]},
	exo_regular_ttf: {type:"font", name:"Exo", srcs:["res/fonts/Exo-Regular.ttf"]},
	
	// murbiks / tutorial
    murbiks_single_png : "res/images/murbiks/mostafa_fly01.png",
    murbiks_png : "res/images/murbiks/murbiks.png",
    murbiks_plist : 'res/images/murbiks/murbiks.plist',
    
    // particles
    particle_lavaflow: "res/particles/LavaFlow.plist",

    // language resources
    language_pack:      "res/i18n/language-pack-de_DE.json",
    language_words:     "res/words/derewo57000.txt.words.json",
    language_letters:   "res/words/derewo57000.txt.letters.json",
    language_prefixes:  "res/words/derewo57000.txt.prefixes.json",

    //language_pack: "language-pack-en_US.json",
    //language_pack: "language-pack-ee_EE.json",
    //language_pack: "language-pack-se_SE.json"
};

var g_resources = [];
for (var r in res) {
    g_resources.push(res[r]);
}

