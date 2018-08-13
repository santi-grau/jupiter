uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;

varying vec2 vUv;

void main() {
	vec4 b0 = texture2D( iChannel0, vUv );
	vec4 b1 = texture2D( iChannel1, vUv );

	vec4 b2 = texture2D( iChannel2, vec2( 0.0, b1.r ) );
	b2.a = b1.a;

	vec4 tex = ( b0 * 0.995 );
	tex.a -= b1.a;
	tex += b1;

	// tex = b1;

	gl_FragColor = tex;
}