import { delay } from '$/utils';

/**
 * @see https://css-tricks.com/using-custom-elements-in-svelte/
 */
export const themeProvider = async (node) => {
  // await import('$/theme/theme.css');
  node.classList.add('f-player');
  // await delay(1000);
};
