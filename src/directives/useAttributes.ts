/**
 * @see https://css-tricks.com/using-custom-elements-in-svelte/
 */
export const attributes = (node, attributes) => {
  const applyAttributes = () => {
    Object.entries(attributes).forEach(([k, v]) => {
      if (v !== undefined) {
        if (typeof v === 'object') v = JSON.stringify(v);

        node.setAttribute(k, v);
      } else {
        node.removeAttribute(k);
      }
    });
  };
  applyAttributes();
  return {
    update(updatedAttributes) {
      attributes = updatedAttributes;
      applyAttributes();
    }
  };
};
