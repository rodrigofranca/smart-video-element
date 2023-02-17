import type { PlaybackStrategy } from './Strategy';
import type { Media } from '$/model/Media';
import type { Entry } from '$/model/Collection';
import { getPlayback } from '$/service/Playback';
import { fetchEpisode } from '$/service/Episode';

export class SeriesStrategy implements PlaybackStrategy {
  async mount(media: Media) {
    const episode = await fetchEpisode(media.id);

    const entry: Entry = {
      audio_tracks: episode.audio_tracks,
      burned_languages: episode.burned_languages,
      captions: episode.captions,
      duration: episode.duration,
      media_id: episode.media_id
    };

    const playback = await getPlayback({
      id: episode.media_id,
      type: 'vod',
      token: media?.token,
      format: media?.format
    });

    if (playback.drm) {
      const licenseServerQueryString = `?season_asset_id=${episode.id}`;
      playback.drm.licenseServer = `${
        playback.drm.licenseServer.split('?')[0]
      }${licenseServerQueryString}`;
    }

    return { playback, entry, episode };
  }
}
