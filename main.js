cc.game.onStart = function(){
    cc.view.setDesignResolutionSize(320, 576, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new MuprisScene());
    }, this);
};
cc.game.run();