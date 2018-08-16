var EventEmitter = require('events').EventEmitter;
var geoWorker = require('webworkify')( require( './geometry' ) );

var Particles = function( settings ){
	THREE.Object3D.apply( this, arguments );

	this.time = Math.random();
	this.timeInc = 0.0001;

	this.texSize = settings.texSize || 64;

	var geometry = new THREE.BufferGeometry();
	var position = [], color = [], uv = [], normal = [];

	this.material = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: this.time }
		},
		fragmentShader: require('./clouds.fs'),
		vertexShader: require('./clouds.vs'),
		transparent: true
	});

	var img = new Image();
	img.addEventListener( 'load', this.imageReady.bind( this ) );
	img.src = 'img/clouds_s.png';
}

Particles.prototype = Object.create( THREE.Object3D.prototype );
Object.assign( Particles.prototype, EventEmitter.prototype );
Particles.prototype.constructor = Particles;

Particles.prototype.imageReady = function( e ){
	var img = e.target;
	var canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	canvas.getContext('2d').drawImage( img, 0, 0, img.width, img.height );
	var pd = canvas.getContext('2d').getImageData( 0, 0, img.width, img.height ).data;

	var a = [];
	for( var i = 0 ; i < pd.length ; i += 4 ) a.push( pd[i] );

	geoWorker.onmessage = this.geometryReady.bind( this );
	geoWorker.postMessage( { 'imgData' : a, 'texSize' : this.texSize }  );
}

Particles.prototype.geometryReady = function( e ){
	var data = JSON.parse( e.data );
	var loader = new THREE.BufferGeometryLoader();
	var geometry = loader.parse( data.geo );
	
	this.particles = new THREE.Points( geometry, this.material );
	this.add( this.particles );

	this.emit('ready');
}

Particles.prototype.step = function( time ){
	this.time += this.timeInc;
	this.material.uniforms.time.value = this.time;
}

module.exports = Particles;