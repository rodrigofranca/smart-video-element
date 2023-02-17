import type { Drm } from './Drm';
import type { Credential } from './Credential';
import type { Engines } from './Engines';
import type { PlayerParams } from './Player';
import type { Extract } from '$/utils/type';
import type { Media } from './Media';

// export type PlaybackType = 'vod' | 'live'
export type PlaybackExtensions = 'mp4' | 'dash' | 'hls';
export type PlaybackFormat = 'dash' | 'hls' | 'simple';

/**
 * Objeto que contém uma estrutura passivel de playback
 */
export type Playback = (
  | {
      type?: Extract<Media['type'], 'vod'>;
      format: Extract<PlaybackFormat, 'simple'>;
    }
  | {
      type: Extract<Media['type'], 'vod'>;
      format: Extract<PlaybackFormat, 'dash'>;
    }
  | {
      type: Extract<Media['type'], 'vod'>;
      format: Extract<PlaybackFormat, 'hls'>;
    }
  | {
      type: Extract<Media['type'], 'stream'>;
      format: Extract<PlaybackFormat, 'hls'>;
    }
) & {
  id?: number;
  credential?: Credential;
  drm?: Drm;
  // token?: string;
  engine?: Engines;
} & Omit<Partial<PlayerParams>, 'drm'>;

/**
 * Objeto que contém uma lista de playbacks válidos
 */
export type AvailableFormats = {
  [K in PlaybackFormat]?: Partial<Playback>;
};
