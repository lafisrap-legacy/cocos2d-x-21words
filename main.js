cc.game.onStart = function(){
    cc.view.setDesignResolutionSize(640, 1152, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new _42Scene());
    }, this);
};
if( !Math.sign ) Math.sign = function(val) {
	return val < 0? -1:1;
}
cc.game.run();