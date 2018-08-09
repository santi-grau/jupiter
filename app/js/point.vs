attribute vec2 reference;
uniform sampler2D texturePosition;

void main() {
	vec3 position = texture2D(texturePosition, reference).xyz;

	vec3 transformed = vec3( position );
	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = 4.0 * (1.0 / -mvPosition.z);
}