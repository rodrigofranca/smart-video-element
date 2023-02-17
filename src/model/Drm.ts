/**
 * Objeto que é contem um DRM pronto para playback
 * As informações desse objeto devem ser processadas antes da atribuição
 * Aqui já devemos saber qual {type} o playback pode tocar, checando OS, browser, codecs, etc
 */
export type Drm = {
  licenseServer: string;
  type: 'com.widevine.alpha' | 'com.microsoft.playready' | 'com.apple.fps';
  token?: string;
};
