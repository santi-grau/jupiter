var ComputeTexture = function( width, height, options, texture, renderer ){
    THREE.WebGLRenderTarget.apply( this, arguments );
   
    // console.log( this, texture );
	this.original = texture;
	this.tex = texture;
    this.renderer = renderer;
    this.even = true;
	this.firstPass = true;

	this.time = 0;
	this.timeInc = 0.00001;

    this.buffer0 = new THREE.WebGLRenderTarget( this.width, this.height, { type: THREE.FloatType, format: THREE.RGBAFormat, magFilter : THREE.NearestFilter } );
	this.buffer1 = new THREE.WebGLRenderTarget( this.width, this.height, { type: THREE.FloatType, format: THREE.RGBAFormat, magFilter : THREE.NearestFilter } );

    this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();

	var width = this.width, height = this.height;
	var camView = { left :  width / -2, right : width / 2, top : height / 2, bottom : height / -2 };
	for ( var prop in camView) this.camera[ prop ] = camView[ prop ];
	this.camera.position.z = 1000;
	this.camera.updateProjectionMatrix( );

	var geometry = new THREE.PlaneBufferGeometry( this.width, this.height );
    var material = new THREE.ShaderMaterial( {
		uniforms: {
            time : { value : this.time },
			iChannel0: { value: this.tex },
			original: { value: this.original }
		},
		transparent : true,
		vertexShader: require('./gpgpu.vs'),
		fragmentShader: require('./gpgpu.fs'),
		blending : THREE.NoBlending
    } );
    
	this.plane = new THREE.Mesh( geometry, material );
	this.scene.add( this.plane );
}

ComputeTexture.prototype = Object.create( THREE.Object3D.prototype );
ComputeTexture.prototype.constructor = ComputeTexture;

ComputeTexture.prototype.step = function( time ){
    this.time += this.timeInc;

    this.plane.material.uniforms.time.value = this.time;

	if( this.even ){
		if( !this.firstPass ) this.plane.material.uniforms.iChannel0.value = this.buffer1.texture;
        this.renderer.render( this.scene, this.camera, this.buffer0 );
	} else {
		this.plane.material.uniforms.iChannel0.value = this.buffer0.texture;
        this.renderer.render( this.scene, this.camera, this.buffer1 );
    }

    
    this.renderer.render( this.scene, this.camera, this );
    
	this.firstPass = false;
    this.even = !this.even;
}

module.exports = ComputeTexture;

