/**
 * CSS Modules Type Definitions
 * Allows TypeScript to understand .module.css imports
 */

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
