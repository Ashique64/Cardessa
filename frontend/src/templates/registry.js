/**
 * Template Component Registry
 *
 * Maps component_key (stored on the backend Template model) → the React component
 * that renders that design.
 *
 * HOW TO ADD A NEW TEMPLATE:
 *   1. Build `src/templates/<new-key>/index.jsx` — the animated design.
 *   2. Import it below and add an entry to TEMPLATE_REGISTRY.
 *   3. Deploy the frontend.
 *   4. In Django Admin, create a Template row with `component_key` matching the key used here.
 *      Toggle `is_active = True` — the template appears in the gallery immediately.
 *
 * Component contract:
 *   Every template component MUST accept these props:
 *     - content        {object}  — user content keyed by the template's field_schema field keys
 *     - mode           {string}  — "live" | "preview" | "editor"
 *     - onRsvpSubmit   {fn}      — async (rsvpData) => void (only used in "live" mode)
 */

import IvoryBloom from "./ivory-bloom";
import FloralArch from "./floral-arch";
import BeginForever from "./begin-forever";

export const TEMPLATE_REGISTRY = {
  "ivory-bloom": IvoryBloom,
  "floral-arch": FloralArch,
  "begin-forever": BeginForever,
};

/**
 * Lookup helper — returns the component or null if the key is not yet registered.
 * Use this instead of accessing TEMPLATE_REGISTRY directly to get a clear
 * error message during development when a new component_key hasn't been wired yet.
 */
export function getTemplateComponent(componentKey) {
  return TEMPLATE_REGISTRY[componentKey] ?? null;
}
