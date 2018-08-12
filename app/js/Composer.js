var EffectComposer = require('three-effectcomposer')(THREE);

var Composer = function( renderer, rendertargetA, renderTargetB, scene, camera ){
	EffectComposer.apply(this, arguments);

	this.scene = scene;
	this.camera = camera;

	this.renderPass = new EffectComposer.RenderPass( this.scene, this.camera );
	this.addPass( this.renderPass);

	this.feedBackPass = {
		uniforms: {
			'tDiffuse': { value: null },
			'rt0' : { value: renderTargetB.texture },
			'rt1' : { value: renderTargetB.texture }
		},
		vertexShader: require('./base.vs'),
		fragmentShader: require('./feedback.fs')
	},
	this.feedBackShader = new EffectComposer.ShaderPass( this.feedBackPass );
	this.addPass( this.feedBackShader );
	this.feedBackShader.renderToScreen = true;
}

Composer.prototype = Object.create(EffectComposer.prototype);
Composer.prototype.constructor = Composer;


Composer.prototype.step = function( time ){

}

module.exports = Composer;