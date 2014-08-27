package org.cocos2dx.lib;

import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

import android.opengl.GLSurfaceView;

import org.cocos2dx.lib.Cocos2dxHelper;


public class MyRenderer extends Cocos2dxRenderer {

private boolean bNativeInitCompleted = false;

@Override
public void handleOnPause() {
	if(!bNativeInitCompleted) return;
	super.handleOnPause();
}

@Override
public void onSurfaceCreated(GL10 pGL10, EGLConfig pEGLConfig) {
	super.onSurfaceCreated(pGL10, pEGLConfig);
	bNativeInitCompleted = true;
}

}