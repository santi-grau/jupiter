window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

var Particles = require('./Particles')
// var Composer = require('./Composer')

var Main = function( ) {
	this.node = document.getElementById('main');

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.node.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();
	var controls = new OrbitControls( this.camera );

	this.particles = new Particles( { texSize : 256 }, this.renderer )
	this.particles.scale.set( 200, 200, 200 );
	this.scene.add( this.particles );
	this.particles.on('ready', this.particlesReady.bind( this ) );
	
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
}

Main.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );

	this.particles.step( time );
	this.renderer.render( this.scene, this.camera );
	
};

var root = new Main();