uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
	vec4 b0 = texture2D( iChannel0, vUv );
	vec4 b1 = texture2D( iChannel1, vUv );
	vec4 tex = ( b1 * ( 1.0 - b0.a ) + b0 ) * 0.96;
	
	// if( tex.r + tex.g + tex.b < 0.01 ) tex = vec4( 0.0 );
	
	gl_FragColor = tex;
}