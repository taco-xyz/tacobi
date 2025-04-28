"use client";

// React Imports
import { useEffect, useRef, FC } from "react";

// Component Imports
import { WebGLRenderer } from "./WebGLRenderer";

// Shader Imports
import { vertexShader } from "./shaders/vertexShader";
import { fragmentShader } from "./shaders/fragmentShader";

// Constants
const gradientStops = [
  "#fb7185",
  "#2563eb",
  "#0ea5e9",
  "#c4b5fd",
  "#1d4ed8",
  "#fdba74",
  "#0ea5e9",
  "#2563eb",
  "#fdba74",
];
const seed = 16192;

/**
 * WebGLShader Component
 *
 * Renders an animated gradient background using WebGL.
 */
export const WebGLShader: FC = () => {
  // Ref for the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Get the canvas element
    const canvas = canvasRef.current;

    // Return early if the canvas element is not found
    if (!canvas) return;

    // Initialize the renderer
    const renderer = new WebGLRenderer(
      canvas,
      vertexShader,
      fragmentShader,
      gradientStops,
      seed,
    );

    // Get the canvas element's dimensions
    const canvasRect = canvas.getBoundingClientRect();

    // Set the dimensions of the renderer
    renderer.setDimensions(canvasRect.width, canvasRect.height);

    // Define the animation loop
    function tick() {
      requestAnimationFrame(tick);
      renderer.render();
    }

    // Start the animation loop
    tick();

    // Clean up WebGL resources when the component unmounts
    return () => {
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
};
