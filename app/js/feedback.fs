uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
	vec4 b0 = texture2D( iChannel0, vUv );
	vec4 b1 = texture2D( iChannel1, vUv );
	


	vec4 tex = ( b0 + b1 ) * 0.9;
	// tex.a -= b1.a;
	// tex += b1;

	// tex = b1;

	// tex *= length( vec2( 0.5 ) - vUv );
	
	// gl_FragColor = tex;

	

	// float center = 1.0 - smoothstep( 0.9, 1.0, length( gl_FragCoord.xy - resolution.xy / 2.0 ) / 400.0 );
	
	gl_FragColor = tex;
	// gl_FragColor = vec4( center, 0.0, 0.0, 1.0 );
}