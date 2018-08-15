window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE)
// var Composer = require('./Composer')

var Main = function( ) {
	this.node = document.getElementById('main');

	this.time = Math.random();
	this.timeInc = 0.0001;

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

	this.planetGroup = new THREE.Object3D();
	
	var particleTexture = new THREE.TextureLoader().load('img/ptex.png');
	var geometry = new THREE.IcosahedronBufferGeometry( 1, 6 );
	
	particleTexture.magFilter = THREE.NearestFilter;
	particleTexture.minFilter = THREE.NearestFilter;

	var material = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: this.time },
			diffuse : { value : new THREE.TextureLoader().load('img/color2.png') },
			pointTexture : { value : particleTexture },
			texturePosition: { value : null },
		},
		fragmentShader: require('./point.fs'),
		vertexShader: require('./point.vs'),
		transparent: true,
		depthTest : false,
		depthWrite : true
	});
	
	this.particles = new THREE.Points(geometry, material);
	this.planetGroup.add( this.particles );

	var geometry = new THREE.SphereGeometry( 201, 32, 32 );
	
	// var material = new THREE.ShaderMaterial({
	// 	uniforms: {
	// 		time: { value: this.time },
	// 		turb : { value : new THREE.TextureLoader().load('img/turb.png') },
	// 		diffuse : { value : new THREE.TextureLoader().load('img/color2.png') },
	// 		texturePosition: { value : null },
	// 	},
	// 	fragmentShader: require('./jupiter.fs'),
	// 	vertexShader: require('./jupiter.vs'),
	// 	transparent: true,
	// 	depthTest : true,
	// 	depthWrite : true
	// });

	var material = new THREE.MeshBasicMaterial( {color: 0x111111} );

	this.sphere = new THREE.Mesh( geometry, material );
	this.planetGroup.add( this.sphere );

	this.planetScene.add( this.planetGroup );





	this.renderTargetA = new THREE.WebGLRenderTarget( this.node.offsetWidth * this.settings.scale, this.node.offsetHeight * this.settings.scale, {  } );
	this.renderTargetB = new THREE.WebGLRenderTarget( this.node.offsetWidth * this.settings.scale, this.node.offsetHeight * this.settings.scale, {  } );
	this.renderTargetC = new THREE.WebGLRenderTarget( this.node.offsetWidth * this.settings.scale, this.node.offsetHeight * this.settings.scale, {  } );

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

	if( this.sphere && this.sphere.material.uniforms ) this.sphere.material.uniforms.time.value = this.time;
	if( this.particles && this.particles.material.uniforms ) this.particles.material.uniforms.time.value = this.time;

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
	
	this.firstPass = false;
	this.renderer.render( this.scene, this.camera );

	// this.planetGroup.rotation.y -= 0.002	
	// this.planetGroup.rotation.x = Math.sin( this.time * Math.PI ) * 0.01;
	// this.renderer.render( this.planetScene, this.planetCamera );

	if( this.even ){
		this.renderer.render( this.scene, this.camera, this.renderTargetC );
	} else {
		this.renderer.render( this.scene, this.camera, this.renderTargetA );
	}

	this.even = !this.even;
};

var root = new Main();