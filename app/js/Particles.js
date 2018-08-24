var EventEmitter = require('events').EventEmitter;
var geoWorker = require('webworkify')( require( './geometry' ) );
var ComputeTexture = require( './ComputeTexture' );

var Particles = function( settings, renderer ){
	THREE.Object3D.apply( this, arguments );

	this.time = Math.random();
	this.timeInc = 0.01;

	this.texSize = settings.texSize || 64;
	this.renderer = renderer;

	var geometry = new THREE.BufferGeometry();
	var position = [], color = [], uv = [], normal = [];

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
	canvas.width = this.texSize;
	canvas.height = this.texSize;
	canvas.getContext('2d').drawImage( img, 0, 0, this.texSize, this.texSize );
	var pd = canvas.getContext('2d').getImageData( 0, 0, this.texSize, this.texSize ).data;

	var a = [];
	for( var i = 0 ; i < pd.length ; i += 4 ) a.push( pd[i] );

	geoWorker.onmessage = this.geometryReady.bind( this );
	geoWorker.postMessage( { 'imgData' : a, 'texSize' : this.texSize }  );
}

Particles.prototype.geometryReady = function( e ){
	var data = JSON.parse( e.data );
	var loader = new THREE.BufferGeometryLoader();
	var geometry = loader.parse( data.geo );
	
	var data = []
	var uvs = geometry.attributes.uv.array;
	var ps = geometry.attributes.position.array;
	
	for( var i = 0 ; i < ps.length ; i += 3 ) data.push( ps[ i ], ps[ i + 1 ], ps[ i + 2 ], Math.random() );

	// for( var i = 0 ; i < uvs.length ; i += 2 ) data.push( uvs[ i ], uvs[ i + 1 ], 0, Math.random() );
	
	var texture = new THREE.DataTexture( new Float32Array( data ), this.texSize, this.texSize, THREE.RGBAFormat, THREE.FloatType );

	texture.needsUpdate = true;
	this.computeTexture = new ComputeTexture( this.texSize, this.texSize, { type: THREE.FloatType, format: THREE.RGBAFormat, magFilter : THREE.NearestFilter }, texture, this.renderer );

	var colorTex = new THREE.TextureLoader().load( 'img/color2.png' );

	var material = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: this.time },
			colr : { value : colorTex },
			data : { value : this.computeTexture.texture }
		},
		fragmentShader: require('./clouds.fs'),
		vertexShader: require('./clouds.vs'),
		transparent: true
	});

	this.particles = new THREE.Points( geometry, material );
	this.add( this.particles );

	this.emit('ready');
}

Particles.prototype.step = function( time ){
	this.time += this.timeInc;
	this.computeTexture.step( time );
	if( this.particles ) this.particles.material.uniforms.time.value = this.time;
}

module.exports = Particles;