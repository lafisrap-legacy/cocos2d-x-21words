cc.game.onStart = function(){
    cc.view.setDesignResolutionSize(450, 800, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new MuprisScene());
    }, this);
};
cc.game.run();