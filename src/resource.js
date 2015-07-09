var res = {
    tiles_png : "res/images/tiles.png",
    tiles_plist : 'res/images/tiles.plist',
    marker_png : "res/images/marker.png",
    marker_plist : 'res/images/marker.plist',
    letters_png : "res/images/letters/letters.png",
    letters_plist : 'res/images/letters/letters.plist',
    title_png : "res/images/title/title.png",
    title_plist : 'res/images/title/title.plist',
	background_png : "res/images/background.png",
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
	
	// murbiks / tutorial
    murbiks_single_png : "res/images/murbiks/mostafa_fly01.png",
    murbiks_png : "res/images/murbiks/murbiks.png",
    murbiks_plist : 'res/images/murbiks/murbiks.plist',
    
    // particles
    particle_lavaflow: "res/particles/LavaFlow.plist"
};

var g_resources = [];
for (var r in res) {
    g_resources.push(res[r]);
}

var i18n_language_packs = [
 	"language-pack-de_DE.json",
    "language-pack-en_US.json",
    "language-pack-ee_EE.json",
    "language-pack-se_SE.json"
];

