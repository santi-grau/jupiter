window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

var Particles = require('./Particles')
// var Composer = require('./Composer')

var Main = function( ) {
	this.node = document.getElementById('main');

	this.even = true;
	this.firstPass = true;

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.node.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();

	// var geometry = new THREE.SphereGeometry( 190, 190, 32 );
	// var material = new THREE.MeshBasicMaterial( {color: 0x660000} );
	// var sphere = new THREE.Mesh( geometry, material );
	// sphere.position.z = -95;
	// this.scene.add( sphere );

	this.renderTargetA = new THREE.WebGLRenderTarget( this.node.offsetWidth * 2, this.node.offsetHeight * 2, {  } );
	this.renderTargetB = new THREE.WebGLRenderTarget( this.node.offsetWidth * 2, this.node.offsetHeight * 2, {  } );
	this.renderTargetC = new THREE.WebGLRenderTarget( this.node.offsetWidth * 2, this.node.offsetHeight * 2, {  } );

	this.planetScene = new THREE.Scene();
	this.planetCamera = new THREE.OrthographicCamera();
	var controls = new OrbitControls( this.planetCamera );
	
	this.particles = new Particles( { texSize : 512 }, this.renderer )
	this.particles.scale.set( 200, 200, 200 );
	this.planetScene.add( this.particles );

	this.particles.on('ready', this.particlesReady.bind( this ) );
	

	var geometry = new THREE.PlaneBufferGeometry( this.node.offsetWidth, this.node.offsetHeight );
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			iChannel0: { value: this.renderTargetA.texture },
			iChannel1 : { value: this.renderTargetB.texture },
			resolution : { value: new THREE.Vector2( this.node.offsetWidth * 2, this.node.offsetHeight * 2 ) }
		},
		transparent : true,
		vertexShader: require('./base.vs'),
		fragmentShader: require('./feedback.fs'),
		blending : THREE.NoBlending
	} );

	this.bufferPlane = new THREE.Mesh( geometry, material );
	this.scene.add( this.bufferPlane );
	
	this.resize();
}

Main.prototype.particlesReady = function(){
	this.step();
}

Main.prototype.resize = function( e ) {
	var width = this.node.offsetWidth, height = this.node.offsetHeight;
	this.renderer.setSize( width * 2, height * 2 );
	this.renderer.domElement.setAttribute( 'style', 'width:' + width + 'px; height:' + height + 'px;' );
	var camView = { left :  width / -2, right : width / 2, top : height / 2, bottom : height / -2 };
	for ( var prop in camView) this.camera[ prop ] = camView[ prop ];
	this.camera.position.z = 1000;
	this.camera.updateProjectionMatrix( );

	for ( var prop in camView) this.planetCamera[ prop ] = camView[ prop ];
	this.planetCamera.position.z = 1000;
	this.planetCamera.updateProjectionMatrix( );
}

Main.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );

	this.particles.step( time );

	if( this.even ){
		if( this.firstPass ) this.renderer.render( this.planetScene, this.planetCamera, this.renderTargetA );
		this.renderer.render( this.planetScene, this.planetCamera, this.renderTargetB );
		this.bufferPlane.material.uniforms.iChannel0.value = this.renderTargetA.texture;
		this.bufferPlane.material.uniforms.iChannel1.value = this.renderTargetB.texture;
	} else {
		this.renderer.render( this.planetScene, this.planetCamera, this.renderTargetB );
		this.bufferPlane.material.uniforms.iChannel0.value = this.renderTargetC.texture;
		this.bufferPlane.material.uniforms.iChannel1.value = this.renderTargetB.texture;
	}
	
	
	this.renderer.render( this.scene, this.camera );

	if( this.even ){
		this.renderer.render( this.scene, this.camera, this.renderTargetC );
	} else {
		this.renderer.render( this.scene, this.camera, this.renderTargetA );
	}
	this.firstPass = false;
	this.even = !this.even;
	// this.renderer.render( this.planetScene, this.planetCamera );

	// this.renderer.render( this.scene, this.camera );
	
};

var root = new Main();