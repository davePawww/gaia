# gaia Storybook

Component development and a11y documentation.

## Accessibility rule suppressions

Some stories suppress axe-core rules for specific violations that originate in framework libraries (base-ui, floating-ui) and cannot be resolved at the component level.

### `aria-hidden-focus`

Applies to stories using `defaultOpen` for Select and Dialog.

floating-ui's `FloatingFocusManager` injects focus guard elements with both `aria-hidden="true"` and `tabindex="0"` for keyboard focus trapping within popups. Each attribute serves a necessary purpose (AT hiding vs keyboard focus trapping), and the libraries do not expose a way to alter them from consumer components.

### `aria-valid-attr-value`

Applies to the Select Open story.

The SelectTrigger's `aria-controls` references the list element's ID, but the popup renders via portal (outside the story root). axe-core's analysis scope is limited to the story root, so it cannot find the referenced element in the DOM, even though it exists in the document. This is a Storybook a11y addon limitation with portal-based components.
