window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE)

var Main = function( ) {
	this.node = document.getElementById('main');

	this.time = Math.random();
	this.timeInc = 0.001;

	

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.node.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();
	var controls = new OrbitControls( this.camera );


	var jupiterTexture = new THREE.TextureLoader().load('img/jupiterDiffuseGs2.png');

	var icoNormalTexture = new THREE.TextureLoader().load('img/icoNormal256.png');

	
	var geometry = new THREE.IcosahedronBufferGeometry( 200, 4 );
	var geometry = new THREE.PlaneBufferGeometry( 256, 256 );
	
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			time: { value: this.time },
			diffuse : { value: jupiterTexture },
			icoNormal : { value: icoNormalTexture }
		},
		vertexShader: require('./jupiter.vs'),
		fragmentShader: require('./jupiter.fs')
	} );

	this.mesh = new THREE.Mesh( geometry, material );

	this.scene.add( this.mesh );

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

	this.time += this.timeInc;

	if( this.mesh.material.uniforms ) this.mesh.material.uniforms.time.value = this.time;

	this.renderer.render( this.scene, this.camera );
};

var root = new Main();