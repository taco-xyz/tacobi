export const vertexShader = /* glsl */ `
  // Use high precision floating point calculations
  precision highp float;

  // Input vertex position (0 to 1 in screen space)
  // Comes from the position buffer defined in WebGLRenderer
  attribute vec2 a_position;

  void main() {
    // Convert from 0->1 space to -1->1 clip space
    // This transforms our quad coordinates to WebGL's coordinate system
    vec2 clipSpace = a_position * 2.0 - 1.0;

    // Set the final vertex position:
    // - Flip Y coordinate (multiply by vec2(1, -1)) because WebGL Y grows up
    // - Z coordinate is 0 (no depth)
    // - W coordinate is 1 (no perspective division)
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`;
