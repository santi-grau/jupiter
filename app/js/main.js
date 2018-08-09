window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE)

var GPUComputationRenderer = require('./GPUComputationRenderer');

var Main = function( ) {
	this.node = document.getElementById('main');

	this.TEXTURE_SIZE = 256;
	this.TEXTURE_HEIGHT = this.TEXTURE_SIZE;
	this.TEXTURE_WIDTH = this.TEXTURE_SIZE * 2;
	this.previousFrame = Date.now() / 1000;

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.node.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();
	var controls = new OrbitControls( this.camera );

	var vertices = new Float32Array( this.TEXTURE_WIDTH * this.TEXTURE_HEIGHT * 3 ).fill( 0 );
	var references = new Float32Array( this.TEXTURE_WIDTH * this.TEXTURE_HEIGHT * 2 );
	
	for (var i = 0; i < references.length; i += 2) {
		var indexVertex = i / 2;
		
		references[i] = ( indexVertex % this.TEXTURE_WIDTH) / this.TEXTURE_WIDTH;
		references[i + 1] = Math.floor(indexVertex / this.TEXTURE_WIDTH) / this.TEXTURE_HEIGHT;
	}
	
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
	geometry.addAttribute('reference', new THREE.BufferAttribute(references, 2));
	
	var material = new THREE.ShaderMaterial({
		uniforms: {
			texturePosition: { value : null },
		},
		fragmentShader: require('./point.fs'),
		vertexShader: require('./point.vs'),
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthTest: false,
		depthWrite: false,
	});
	
	this.particles = new THREE.Points(geometry, material);
	this.scene.add( this.particles );

	this.gpuComputationRenderer = new GPUComputationRenderer( this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT, this.renderer );

	var dataPosition = this.gpuComputationRenderer.createTexture();
	var dataVelocity = this.gpuComputationRenderer.createTexture();
	var textureArraySize = this.TEXTURE_WIDTH * this.TEXTURE_HEIGHT * 4;

	for ( var i = 0; i < textureArraySize; i += 4 ) {
		var radius = (1 - Math.pow(Math.random(), 3)) * 1;
		var azimuth = Math.random() * Math.PI;
		var inclination = Math.random() * Math.PI * 2;
		var velocityAzimuthOffset = Math.PI / 2;

		dataPosition.image.data[i] = Math.random();
		dataPosition.image.data[i + 1] = Math.random();
		dataPosition.image.data[i + 2] = Math.random();
		
		dataVelocity.image.data[i] = 0;
		dataVelocity.image.data[i + 1] = 0;
		dataVelocity.image.data[i + 2] = 0;
		dataVelocity.image.data[i + 3] = 1;
	}

	this.variableVelocity = this.gpuComputationRenderer.addVariable('textureVelocity', require('./velocity.fs'), dataVelocity);
	this.variablePosition = this.gpuComputationRenderer.addVariable('texturePosition', require('./position.fs'), dataPosition);

	this.variablePosition.material.uniforms.delta = { value: 0 };

	this.gpuComputationRenderer.setVariableDependencies(this.variableVelocity, [ this.variableVelocity, this.variablePosition ]);
	this.gpuComputationRenderer.setVariableDependencies(this.variablePosition, [ this.variableVelocity, this.variablePosition ]);

	this.variablePosition.wrapS = THREE.RepeatWrapping;
	this.variablePosition.wrapT = THREE.RepeatWrapping;
	this.variableVelocity.wrapS = THREE.RepeatWrapping;
	this.variableVelocity.wrapT = THREE.RepeatWrapping;

	this.gpuComputationRenderer.init();
	
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
}

Main.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );

	var now = Date.now() / 1000;
	var delta = now - this.previousFrame;
	this.previousFrame = now;

	this.gpuComputationRenderer.compute();
	this.variablePosition.material.uniforms.delta.value = Math.min(delta, 0.5);
	this.particles.material.uniforms.texturePosition.value = this.gpuComputationRenderer.getCurrentRenderTarget(this.variablePosition).texture;

	this.renderer.render( this.scene, this.camera );
};

var root = new Main();