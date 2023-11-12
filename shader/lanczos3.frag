// From https://raw.githubusercontent.com/Sentmoraap/doing-sdl-right/93a52a0db0ff2da5066cce12f5b9a2ac62e6f401/assets/lanczos3.frag
// Copyright 2020 Lilian Gimenez (Sentmoraap).
// mkxp-z modifications Copyright 2022-2023 Splendide Imaginarius.
// MIT license.

// Unfortunately it seems that on at least some mediump platforms, this shader shows a solid color.
// Patches welcome.
#ifdef GL_ES
	#ifdef GL_FRAGMENT_PRECISION_HIGH
		precision highp float;
	#else
		precision mediump float;
	#endif
#endif

uniform sampler2D texture;
uniform vec2 sourceSize;
varying vec2 v_texCoord;

float lanczos3(float x)
{
	// 0.0001 is nonzero in mediump mode; 0.00001 is zero there.
	#if defined(GL_ES) && !defined(GL_FRAGMENT_PRECISION_HIGH)
		x = max(abs(x), 0.0001);
	#else
		x = max(abs(x), 0.00001);
	#endif
	float val = x * 3.141592654;
	return sin(val) * sin(val / 3.0) / (val * val);
}

void main()
{
	vec2 pixel = v_texCoord * sourceSize + 0.5;
	vec2 frac = fract(pixel);
	vec2 onePixel = 1.0 / sourceSize;
	pixel = floor(pixel) * onePixel - onePixel / 2.0;

	float lanczosX[6];
	float sum = 0.0;
	for(int x = 0; x < 6; x++)
	{
		lanczosX[x] = lanczos3(float(x) - 2.0 - frac.x);
		sum += lanczosX[x];
	}
	for(int x = 0; x < 6; x++) lanczosX[x] /= sum;
	sum = 0.0;
	float lanczosY[6];
	for(int y = 0; y < 6; y++)
	{
		lanczosY[y] = lanczos3(float(y) - 2.0 - frac.y);
		sum += lanczosY[y];
	}
	for(int y = 0; y < 6; y++) lanczosY[y] /= sum;
	gl_FragColor = vec4(0);
	for(int y = -2; y <= 3; y++)
	{
		vec4 colour = vec4(0);
		for(int x = -2; x <= 3; x++)
			colour += texture2D(texture, pixel + vec2(float(x) * onePixel.x, float(y) * onePixel.y)).rgba * lanczosX[x + 2];
		gl_FragColor += colour * lanczosY[y + 2];
	}
}
