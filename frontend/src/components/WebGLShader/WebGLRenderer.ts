/**
 * Number of time uniforms used in the shader.
 * Each time uniform can have different speeds and seeds for varied animation effects.
 */
const N_TIME_VALUES = 2;

/**
 * Generates uniform names for multiple time values (u_time, u_time2, u_time3, etc.)
 */
function timeKey(index: number) {
  let key = "u_time";
  if (index > 0) key += String(index + 1);
  return key;
}

/**
 * State for managing time-based animations
 */
interface TimeState {
  seed: number; // Initial time offset
  lastTime: number; // Last frame timestamp
  elapsed: number; // Total time elapsed
  timeSpeed: number; // Animation speed multiplier
}

/**
 * WebGL renderer for animated gradient effects.
 * Handles shader compilation, texture management, and animation rendering.
 */
export class WebGLRenderer {
  // Animation state for multiple time uniforms
  private timeStates: TimeState[];

  // Core WebGL objects
  private gl: WebGLRenderingContext; // WebGL context
  private program: WebGLProgram; // Compiled shader program
  private positionBuffer: WebGLBuffer; // Vertex positions
  private gradientTexture: WebGLTexture; // Color gradient lookup

  // Shader attributes
  private a_position: number; // Vertex position attribute location

  // Cache for uniform locations to avoid repeated lookups
  private uniformLocations = new Map<string, WebGLUniformLocation | null>();

  // Constructor ----------------------------------------------------------------

  /**
   * Creates a new WebGL renderer
   * @param canvas - The canvas element to render to
   * @param vertexShader - GLSL vertex shader source
   * @param fragmentShader - GLSL fragment shader source
   * @param gradientStops - Array of CSS colors defining the gradient
   * @param seed - Initial time offset for animations
   */
  constructor(
    canvas: HTMLCanvasElement,
    vertexShader: string,
    fragmentShader: string,
    gradientStops: string[],
    seed: number,
  ) {
    // Initialize WebGL context with premultiplied alpha disabled for correct blending
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
    if (!gl) {
      throw new Error("Failed to acquire WebGL context");
    }
    this.gl = gl;

    // Compile and link shaders
    this.program = WebGLRenderer.createProgram(
      gl,
      vertexShader,
      fragmentShader,
    );

    // Create buffers and textures
    this.positionBuffer = gl.createBuffer();
    this.gradientTexture = gl.createTexture();
    this.a_position = gl.getAttribLocation(this.program, "a_position");

    // Initialize animation states
    this.timeStates = Array.from({ length: N_TIME_VALUES }).map(() => ({
      seed,
      lastTime: Date.now(),
      elapsed: 0,
      timeSpeed: 1,
    }));

    // Generate gradient texture from color stops
    WebGLRenderer.writeGradientToTexture(
      gl,
      gradientStops,
      this.gradientTexture,
      1000, // Texture width
      2, // Texture height
    );

    // Set up vertex attributes and use shader program
    gl.vertexAttribPointer(this.a_position, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(this.program);
  }

  // Public Methods ------------------------------------------------------------

  /**
   * Renders a frame of the animation
   * Updates time uniforms and draws the quad with current gradient state
   */
  public render() {
    const { gl } = this;
    const now = Date.now();

    // Update viewport to match canvas size
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Update time uniforms for animations
    for (let i = 0; i < N_TIME_VALUES; i++) {
      const state = this.timeStates[i];
      state.elapsed += (now - state.lastTime) * state.timeSpeed;
      state.lastTime = now;
      const time = state.seed + state.elapsed / 1000;
      gl.uniform1f(this.getUniformLocation(timeKey(i)), time);
    }

    // Update canvas dimension uniforms
    gl.uniform1f(this.getUniformLocation("u_w"), gl.canvas.width);
    gl.uniform1f(this.getUniformLocation("u_h"), gl.canvas.height);

    // Bind gradient texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.gradientTexture);
    gl.uniform1i(this.getUniformLocation("u_gradient"), 0);

    // Clear canvas
    this.clear();

    // Draw fullscreen quad
    gl.vertexAttribPointer(this.a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, this.positions().length / 2);
  }

  /**
   * Updates the rendering dimensions
   * Resizes the canvas and updates vertex buffer
   */
  public setDimensions(width: number, height: number) {
    const { gl } = this;
    const canvas = gl.canvas;
    canvas.width = width;
    canvas.height = height;

    // Update vertex positions for new dimensions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.positions()),
      gl.STATIC_DRAW,
    );
  }

  /**
   * Cleans up WebGL resources
   * Should be called when the renderer is no longer needed
   */
  public dispose() {
    const { gl } = this;

    // Clean up buffers
    gl.deleteBuffer(this.positionBuffer);

    // Clean up textures
    gl.deleteTexture(this.gradientTexture);

    const shaders = gl.getAttachedShaders(this.program);
    if (shaders) {
      shaders.forEach((shader) => gl.deleteShader(shader));
    }
    gl.deleteProgram(this.program);
  }

  // Private Methods ------------------------------------------------------------

  /**
   * Gets or creates uniform location from cache
   */
  private getUniformLocation(key: string): WebGLUniformLocation | null {
    let location = this.uniformLocations.get(key);
    if (location == null) {
      location = this.gl.getUniformLocation(this.program, key);
      this.uniformLocations.set(key, location);
    }
    return location;
  }

  /**
   * Returns vertex positions for a fullscreen quad
   * Uses two triangles to cover the entire canvas
   */
  private positions() {
    // prettier-ignore
    return [
      0, 0,   1, 0,   0, 1, // Top-left triangle
      1, 1,   1, 0,   0, 1, // Bottom-right triangle
    ];
  }

  /**
   * Clears the canvas with transparent black
   */
  private clear() {
    const { gl } = this;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /**
   * Creates a texture from gradient color stops
   * Uses a temporary canvas to generate the gradient
   */
  private static writeGradientToTexture(
    gl: WebGLRenderingContext,
    gradientStops: string[],
    texture: WebGLTexture,
    width: number,
    height: number,
  ) {
    // Create temporary canvas for gradient generation
    const canvas = document.createElement("canvas");
    canvas.height = height;
    canvas.width = width;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas 2D context");

    // Draw linear gradient using color stops
    const linearGradient = ctx.createLinearGradient(0, 0, width, 0);
    for (const [i, stop] of gradientStops.entries()) {
      const t = i / (gradientStops.length - 1);
      linearGradient.addColorStop(t, stop);
    }
    ctx.fillStyle = linearGradient;
    ctx.fillRect(0, 0, width, height);

    // Upload canvas to WebGL texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Clean up temporary canvas
    ctx.clearRect(0, 0, width, height);
  }

  /**
   * Creates and compiles a WebGL shader
   * @throws Error if shader compilation fails
   */
  private static createShader(
    gl: WebGLRenderingContext,
    type:
      | WebGLRenderingContext["VERTEX_SHADER"]
      | WebGLRenderingContext["FRAGMENT_SHADER"],
    source: string,
  ): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error("Failed to create shader");
    }

    // Compile shader
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check compilation status
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    // Handle compilation errors
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error("Failed to compile shader");
  }

  /**
   * Creates and links a WebGL program from vertex and fragment shaders
   * @throws Error if program linking fails
   */
  private static createProgram(
    gl: WebGLRenderingContext,
    vertexShader: string,
    fragmentShader: string,
  ) {
    const program = gl.createProgram();

    // Attach compiled shaders
    gl.attachShader(
      program,
      this.createShader(gl, gl.VERTEX_SHADER, vertexShader),
    );
    gl.attachShader(
      program,
      this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShader),
    );

    // Link program
    gl.linkProgram(program);

    // Check link status
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {
      return program;
    }

    // Handle linking errors
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error("Failed to create shader");
  }
}
