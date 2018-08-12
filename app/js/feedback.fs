uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

varying vec2 vUv;

void main() {
	vec4 b0 = texture2D( iChannel0, vUv );
	vec4 b1 = texture2D( iChannel1, vUv );

	vec4 tex = ( b0 + b1 ) * 0.98;

	gl_FragColor = tex;
}