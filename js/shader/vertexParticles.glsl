uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
attribute float randomness;
varying float vRandomness;
float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  vRandomness = randomness;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1. );
  gl_PointSize = 30000. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
