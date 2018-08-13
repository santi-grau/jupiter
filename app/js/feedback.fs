uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec2 resolution;

varying vec2 vUv;


float czm_luminance(vec3 rgb){
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	return dot(rgb, W);
}

vec3 rgb2hsv(vec3 c){
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c){
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {
	vec4 b0 = texture2D( iChannel0, vUv );
	vec4 b1 = texture2D( iChannel1, vUv );
	
	// float l0 = czm_luminance( b0.rgb );
	// float l1 = czm_luminance( b1.rgb );
	// vec3 c0 = rgb2hsv( b0.rgb );
	// vec3 c1 = rgb2hsv( b1.rgb );

	// vec3 r = ( c0 + c1 );

	// r *= 0.99;

	vec4 tex = ( b1 * ( 1.01 - b0.a ) + b0 ) * 0.98;
	// tex.a -= b1.a;
	// tex += b1;

	// tex = b1;

	// tex *= length( vec2( 0.5 ) - vUv );
	
	// gl_FragColor = tex;

	

	// float center = 1.0 - smoothstep( 0.9, 1.0, length( gl_FragCoord.xy - resolution.xy / 2.0 ) / 400.0 );
	
	gl_FragColor = tex;
	// gl_FragColor = vec4( r, ( b0.a + b1.a ) / 2.0 );
	// gl_FragColor = vec4( center, 0.0, 0.0, 1.0 );
}