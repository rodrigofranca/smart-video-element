export const createEvent = (event, detail?: any): CustomEvent<typeof detail> =>
  new CustomEvent<typeof detail>(event, {
    composed: true,
    bubbles: true,
    detail: detail
  });
