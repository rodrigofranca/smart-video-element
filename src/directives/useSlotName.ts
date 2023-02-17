/**
 * @see https://css-tricks.com/using-custom-elements-in-svelte/
 * @see https://github.com/sveltejs/svelte/issues/1689
 */
export const slotName = (node, name) => {
  name && node.setAttribute('slot', name);
};
