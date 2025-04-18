// .github/strip-query.mjs
import { resolve as defaultResolve } from "module";

export function resolve(specifier, context, defaultResolveFn) {
  // drop everything after “?”
  const clean = specifier.split("?")[0];
  return defaultResolveFn(clean, context, defaultResolveFn);
}

export function load(url, context, defaultLoad) {
  // delegate to the built‑in loader
  return defaultLoad(url, context, defaultLoad);
}
