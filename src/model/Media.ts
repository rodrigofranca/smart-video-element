import type { Playback as PlaybackType } from './Playback';
/**
 * Representa uma mídia do Fantascope
 * @param Media.id - Id do conteúdo no Fantascope - *_pode ser collectionId, seasonAssetId, mediaId ou streamId_*
 * @param Media.type - Tipo de conteúdo
 */
export type Media = {
  /**
   * Id do vod ou live disponibilizada pelo Fantascope
   */
  id: number;
  /**
   * Tipo de transmissão
   *
   * *Ajuda o player a antecipar ações antes dos retornos de API*
   */
  // type: 'vod' | 'stream' | 'live' | 'movie' | 'series';
  type: 'vod' | 'stream' | 'collection' | 'serie';
  token?: string;
  format?: Extract<PlaybackType['format'], 'hls' | 'dash'>;
  // position?: PlaybackType['position'];
};
