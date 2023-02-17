import { delay } from '$/utils';

/**
 * @see https://css-tricks.com/using-custom-elements-in-svelte/
 */
export const props = (node: HTMLElement, properties) => {
  const applyProperties = async () => {
    if (!properties) return;
    Object.entries(properties).forEach(([k, v]) => {
      node[k] = v;
    });
  };

  (async () => {
    await delay(100);
    applyProperties();
  })();

  return {
    update(updatedProperties) {
      properties = updatedProperties;
      applyProperties();
    }
  };
};
