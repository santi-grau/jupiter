attribute vec2 puv;

uniform float time;
uniform sampler2D colr;
uniform sampler2D data;

varying float vAlpha;
varying vec3 vColor;

void main() {
	vec3 p = position;
	vec4 c = texture2D( data, puv );
	vAlpha = c.a;

	// vColor = texture2D( colr, vec2( 0.0, ( c.g + 1.0 ) / 2.0 ) ).rgb;
	float clr = texture2D( colr, vec2( 0.0, ( c.g + 1.0 ) / 2.0 ) ).r;
	vColor = vec3( 1.0 );
	vColor *= c.b;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( normalize( c.rgb ), 1.0 );
	gl_PointSize = 2.0;
}