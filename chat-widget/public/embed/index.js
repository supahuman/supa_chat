/**
 * SupaChatbot Embed Widget - Entry Point
 *
 * This file serves as the main entry point for the embed widget.
 * It loads the modular embed system.
 */

// Load the modular embed system
const script = document.createElement("script");
script.src = "./embed/embed-modular.js";
script.async = true;
document.head.appendChild(script);
