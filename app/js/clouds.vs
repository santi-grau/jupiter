varying vec2 vUv;

uniform float time;

vec3 applyAxisAngle( vec3 v, vec3 axis, float angle ){
	float halfAngle = angle / 2.0;

	float s = sin( halfAngle );
	vec4 q = vec4( axis.x * s, axis.y * s, axis.z * s, cos( halfAngle ) );

	float ix =  q.w * v.x + q.y * v.z - q.z * v.y;
	float iy =  q.w * v.y + q.z * v.x - q.x * v.z;
	float iz =  q.w * v.z + q.x * v.y - q.y * v.x;
	float iw = - q.x * v.x - q.y * v.y - q.z * v.z;

	vec3 res;
	res.x = ix * q.w + iw * - q.x + iy * - q.z - iz * - q.y;
	res.y = iy * q.w + iw * - q.y + iz * - q.x - ix * - q.z;
	res.z = iz * q.w + iw * - q.z + ix * - q.y - iy * - q.x;

	return res;
}

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}