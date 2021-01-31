uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying float vRandomness;
float PI = 3.141592653589793238;
void main()	{
    vec2 uv = vec2(gl_PointCoord.x, 1.-gl_PointCoord.y);
    vec2 centeredUv = 2. * (uv-0.5);

    float intensity = 0.08 / length(centeredUv) * vRandomness;

    vec3 colour = vec3(4., 10., 20.)/255.;
    colour *= min(10.,intensity) * 12.;

    float alpha = min(1., intensity);

	gl_FragColor = vec4(colour, alpha);
}
