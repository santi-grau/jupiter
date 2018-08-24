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
	vColor = vec3( texture2D( colr, vec2( 0.0, ( c.g + 1.0 ) / 2.0 ) ).r );


	gl_Position = projectionMatrix * modelViewMatrix * vec4( normalize( c.rgb ), 1.0 );
	gl_PointSize = 3.0;
}