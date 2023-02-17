import type { PlaybackStrategy } from './Strategy';
import type { Media } from '$/model/Media';
import { fetchMovie } from '$/service/Movie';
import { getPlayback } from '$/service/Playback';
import { fetchCollection } from '$/service/Collection';
import type { Playback } from '$/model/Playback';

export class CollectionStrategy implements PlaybackStrategy {
  async mount(media: Media) {
    const collection = await fetchCollection(media.id);

    let playback: Playback;
    let entry;
    if (collection.type === 'movie') {
      playback = await getPlayback({
        id: collection.entry.media_id,
        type: 'vod',
        token: media?.token,
        format: media?.format
      });
    }
    if (collection.type === 'stream') {
      playback = await getPlayback({
        id: collection.id,
        type: 'collection',
        token: media?.token,
        format: media?.format
      });
    }

    entry = collection['entry'];

    if (playback.drm) {
      const licenseServerQueryString = `?collection_id=${collection.id}`;
      playback.drm.licenseServer = `${
        playback.drm.licenseServer.split('?')[0]
      }${licenseServerQueryString}`;
    }

    return { playback, entry, collection };
  }
}
