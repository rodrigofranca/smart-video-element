import type { PlaybackStrategy } from './Strategy';
import type { Media } from '$/model/Media';
import type { Playback } from '$/model/Playback';
import type { Entry } from '$/model/Collection';
import { fetchMovie } from '$/service/Movie';
import { getPlayback } from '$/service/Playback';

export class MovieStrategy implements PlaybackStrategy {
  async mount(media: Media) {
    const collection = await fetchMovie(media.id);
    let playback: Playback;
    let entry: Entry;

    if (collection.type === 'movie') {
      playback = await getPlayback({
        id: collection.entry.media_id,
        type: 'vod',
        token: media?.token,
        format: media?.format
      });
      entry = collection['entry'];
    }

    if (playback?.drm) {
      const licenseServerQueryString = `?collection_id=${collection.id}`;
      playback.drm.licenseServer = `${
        playback.drm.licenseServer.split('?')[0]
      }${licenseServerQueryString}`;
    }

    return { playback, entry, collection };
  }
}
