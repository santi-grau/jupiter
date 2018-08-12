window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE)
// var Composer = require('./Composer')

var Main = function( ) {
	this.node = document.getElementById('main');

	this.time = Math.random();
	this.timeInc = 0.001;

	this.even = true;
	this.firstPass = true;

	this.settings = {
		scale : 2
	}

	this.texSize = 256;

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.node.appendChild( this.renderer.domElement );

	this.planetScene = new THREE.Scene();
	this.planetCamera = new THREE.OrthographicCamera();
	var controls = new OrbitControls( this.planetCamera );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();
	


	
	// this.composer = new Composer( this.renderer, this.renderTargetA, this.renderTargetB, this.scene, this.camera );


	var jupiterTexture = new THREE.TextureLoader().load('img/color.png');
	
	var geometry = new THREE.IcosahedronBufferGeometry( 1, 4 );
	
	var material = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: this.time },
			diffuse : { value : jupiterTexture },
			texturePosition: { value : null },
		},
		fragmentShader: require('./point.fs'),
		vertexShader: require('./point.vs'),
		side: THREE.DoubleSide,
		transparent: true,
		depthTest: true,
		depthWrite: true
	});
	
	this.particles = new THREE.Points(geometry, material);
	this.planetScene.add( this.particles );

	var geometry = new THREE.SphereGeometry( 199, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
	var sphere = new THREE.Mesh( geometry, material );
	this.planetScene.add( sphere );





	this.renderTargetA = new THREE.WebGLRenderTarget( this.node.offsetWidth * this.settings.scale, this.node.offsetHeight * this.settings.scale, { depthBuffer : false, stencilBuffer : false } );
	this.renderTargetB = new THREE.WebGLRenderTarget( this.node.offsetWidth * this.settings.scale, this.node.offsetHeight * this.settings.scale, { depthBuffer : false, stencilBuffer : false } );
	this.renderTargetC = new THREE.WebGLRenderTarget( this.node.offsetWidth * this.settings.scale, this.node.offsetHeight * this.settings.scale, { depthBuffer : false, stencilBuffer : false } );

	this.bufferScene = new THREE.Scene();
	this.bufferCam = new THREE.OrthographicCamera();

	var camView = { left :  this.node.offsetWidth / -2, right : this.node.offsetWidth / 2, top : this.node.offsetHeight / 2, bottom : this.node.offsetHeight / -2 };
	for ( var prop in camView) this.bufferCam[ prop ] = camView[ prop ];
	this.bufferCam.position.z = 1000;
	this.bufferCam.updateProjectionMatrix( );

	var geometry = new THREE.PlaneBufferGeometry( this.node.offsetWidth, this.node.offsetHeight );
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			iChannel0: { value: this.renderTargetA.texture },
			iChannel1 : { value: this.renderTargetB.texture }
		},
		transparent : true,
		vertexShader: require('./base.vs'),
		fragmentShader: require('./feedback.fs'),
		blending : THREE.NoBlending
	} );

	this.bufferPlane = new THREE.Mesh( geometry, material );
	this.scene.add( this.bufferPlane );


	this.resize();
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

	this.time += this.timeInc;

	if( this.particles ) this.particles.material.uniforms.time.value = this.time;

	if( this.even ){
		if( this.firstPass ) this.renderer.render( this.planetScene, this.planetCamera, this.renderTargetA );
		this.renderer.render( this.planetScene, this.planetCamera, this.renderTargetB );
		this.bufferPlane.material.uniforms.iChannel0.value = this.renderTargetA.texture;
		this.bufferPlane.material.uniforms.iChannel1.value = this.renderTargetB.texture;
	} else {
		this.renderer.render( this.planetScene, this.planetCamera, this.renderTargetB );
		this.bufferPlane.material.uniforms.iChannel0.value = this.renderTargetB.texture;
		this.bufferPlane.material.uniforms.iChannel1.value = this.renderTargetC.texture;
	}
	
	this.firstPass = false;
	this.renderer.render( this.scene, this.camera );

	if( this.even ){
		this.renderer.render( this.scene, this.camera, this.renderTargetC );
	} else {
		this.renderer.render( this.scene, this.camera, this.renderTargetA );
	}

	

	this.even = !this.even;
};

var root = new Main();