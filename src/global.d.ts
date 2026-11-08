// Type declarations for CSS imports used by the default Expo web scaffold.
// `*.module.css` resolves to a map of class names; plain/global `*.css` is a
// side-effect-only module.
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css';
