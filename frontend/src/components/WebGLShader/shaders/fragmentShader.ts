// Utils Imports
import { simplex_noise } from "./utils/simplexNoise";

// Animation and blur configuration
const blurAmount = 345; // Controls the overall blur intensity
const blurQuality = 7; // Number of samples for blur calculation
const blurExponentRange = [0.9, 1.2]; // Range for blur falloff exponent

export const fragmentShader = /* glsl */ `
    // Use high precision floating point calculations
    precision highp float;

    // Uniforms passed from JavaScript
    uniform float u_time;     // Animation time in seconds
    uniform float u_h;        // Canvas height in pixels
    uniform float u_w;        // Canvas width in pixels
    uniform sampler2D u_gradient; // Gradient color lookup texture
  
    const float PI = 3.14159;

    // Wave positioning and dimensions
    // Two waves with different heights and vertical positions
    float WAVE1_Y = 0.45 * u_h, WAVE2_Y = 0.9 * u_h;           // Vertical positions
    float WAVE1_HEIGHT = 0.195 * u_h, WAVE2_HEIGHT = 0.144 * u_h; // Wave amplitudes
  
    // Import simplex noise implementation
    ${simplex_noise}

    // Calculate x-coordinate with center offset for noise generation
    float get_x() {
      return 900.0 + gl_FragCoord.x - u_w / 2.0;
    }
  
    // Easing and interpolation functions
    float smoothstep(float t) {
      // Smoothstep polynomial for smooth transitions
      return t * t * t * (t * (6.0 * t - 15.0) + 10.0);
    }

    float lerp(float a, float b, float t) {
      // Linear interpolation between two values
      return a * (1.0 - t) + b * t;
    }

    float ease_in(float x) {
      // Cosine easing function for smooth acceleration
      return 1.0 - cos((x * PI) * 0.5);
    }

    // Calculate partial alpha value for wave edges with blur
    float wave_alpha_part(float dist, float blur_fac, float t) {
      // Calculate blur exponent based on t
      float exp = mix(${blurExponentRange[0].toFixed(5)}, ${blurExponentRange[1].toFixed(5)}, t);
      // Apply blur with variable exponent
      float v = pow(blur_fac, exp);
      v = ease_in(v);
      v = smoothstep(v);
      v = clamp(v, 0.008, 1.0);
      v *= ${blurAmount.toFixed(1)};
      // Calculate alpha based on distance and blur
      float alpha = clamp(0.5 + dist / v, 0.0, 1.0);
      alpha = smoothstep(alpha);
      return alpha;
    }

    // Generate background noise pattern
    float background_noise(float offset) {
      const float S = 0.064;    // Time scale
      const float L = 0.00085;  // Base spatial scale
      // Layer scales and frequencies
      const float L1 = 1.5, L2 = 0.9, L3 = 0.6;    // X scales
      const float LY1 = 1.00, LY2 = 0.85, LY3 = 0.70; // Y scales
      const float F = 0.04;     // Movement speed
      const float Y_SCALE = 1.0 / 0.27; // Vertical adjustment

      // Calculate base coordinates
      float x = get_x() * L;
      float y = gl_FragCoord.y * L * Y_SCALE;
      float time = u_time + offset;
      float x_shift = time * F;

      // Layer multiple noise octaves with different frequencies
      float sum = 0.5;
      sum += simplex_noise(vec3(x * L1 +  x_shift * 1.1, y * L1 * LY1, time * S)) * 0.30;
      sum += simplex_noise(vec3(x * L2 + -x_shift * 0.6, y * L2 * LY2, time * S)) * 0.25;
      sum += simplex_noise(vec3(x * L3 +  x_shift * 0.8, y * L3 * LY3, time * S)) * 0.20;
      return sum;
    }

    // Generate vertical wave movement
    float wave_y_noise(float offset) {
      const float L = 0.000845; // Spatial scale
      const float S = 0.075;    // Time scale
      const float F = 0.026;    // Movement speed

      float time = u_time + offset;
      float x = get_x() * L;
      float y = time * S;
      float x_shift = time * F;

      // Layer multiple noise frequencies for organic movement
      float sum = 0.0;
      sum += simplex_noise(vec2(x * 1.30 + x_shift, y * 0.54)) * 0.85;
      sum += simplex_noise(vec2(x * 1.00 + x_shift, y * 0.68)) * 1.15;
      sum += simplex_noise(vec2(x * 0.70 + x_shift, y * 0.59)) * 0.60;
      sum += simplex_noise(vec2(x * 0.40 + x_shift, y * 0.48)) * 0.40;
      return sum;
    }

    // Calculate time-varying blur bias
    float calc_blur_bias() {
      const float S = 0.261;
      float bias_t = (sin(u_time * S) + 1.0) * 0.5;
      return lerp(-0.17, -0.04, bias_t);
    }

    // Calculate blur amount with noise
    float calc_blur(float offset) {
      const float L = 0.0011;  // Spatial scale
      const float S = 0.07;    // Time scale
      const float F = 0.03;    // Movement speed
      
      float time = u_time + offset;
      float x = get_x() * L;
      
      // Start with base blur bias
      float blur_fac = calc_blur_bias();
      // Add noise layers for organic blur variation
      blur_fac += simplex_noise(vec2(x * 0.60 + time * F *  1.0, time * S * 0.7)) * 0.5;
      blur_fac += simplex_noise(vec2(x * 1.30 + time * F * -0.8, time * S * 1.0)) * 0.4;
      blur_fac = (blur_fac + 1.0) * 0.5;
      blur_fac = clamp(blur_fac, 0.0, 1.0);
      return blur_fac;
    }

    // Calculate wave alpha value with multi-sample blur
    float wave_alpha(float Y, float wave_height, float offset) {
      // Calculate wave position with noise
      float wave_y = Y + wave_y_noise(offset) * wave_height;
      float dist = wave_y - gl_FragCoord.y;
      float blur_fac = calc_blur(offset);
      
      // Multi-sample blur calculation
      const float PART = 1.0 / float(${blurQuality.toFixed(1)});
      float sum = 0.0;
      for (int i = 0; i < ${blurQuality}; i++) {
        float t = ${blurQuality} == 1 ? 0.5 : PART * float(i);
        sum += wave_alpha_part(dist, blur_fac, t) * PART;
      }
      return sum;
    }
  
    // Convert lightness value to gradient color
    vec3 calc_color(float lightness) {
      lightness = clamp(lightness, 0.0, 1.0);
      return vec3(texture2D(u_gradient, vec2(lightness, 0.5)));
    }
  
    void main() {
      // Calculate noise values for background and waves
      float bg_lightness = background_noise(-192.4);
      float w1_lightness = background_noise( 273.3);
      float w2_lightness = background_noise( 623.1);

      // Calculate wave alpha values
      float w1_alpha = wave_alpha(WAVE1_Y, WAVE1_HEIGHT, 112.5 * 48.75);
      float w2_alpha = wave_alpha(WAVE2_Y, WAVE2_HEIGHT, 225.0 * 36.00);

      // Blend layers together
      float lightness = bg_lightness;
      lightness = lerp(lightness, w2_lightness, w2_alpha);
      lightness = lerp(lightness, w1_lightness, w1_alpha);

      // Output final color with full opacity
      gl_FragColor = vec4(calc_color(lightness), 1.0);
    }
  `;
