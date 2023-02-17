// * Principais eventos:
// * abort: Fired when the resource was not fully loaded, but not as the result of an error.
// * canplay: Fired when the user agent can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content
// * canplaythrough: Fired when the user agent can play the media, and estimates that enough data has been loaded to play the media up to its end without having to stop for further buffering of content.
// * durationchange: Fired when the duration attribute has been updated.
// * emptied: Fired when the media has become empty; for example, when the media has already been loaded (or partially loaded), and the HTMLMediaElement.load() method is called to reload it.
// * ended: Fired when playback stops when end of the media (<audio> or <video>) is reached or because no further data is available.
// * error: Fired when the resource could not be loaded due to an error.
// * loadeddata: Fired when the first frame of the media has finished loading.
// * loadedmetadata: Fired when the metadata has been loaded
// * loadstart: Fired when the browser has started to load a resource.
// * pause: Fired when a request to pause play is handled and the activity has entered its paused state, most commonly occurring when the media's HTMLMediaElement.pause() method is called.
// * play: Fired when the paused property is changed from true to false, as a result of the HTMLMediaElement.play() method, or the autoplay attribute
// * playing: Fired when playback is ready to start after having been paused or delayed due to lack of data
// * progress: Fired periodically as the browser loads a resource.
// * ratechange: Fired when the playback rate has changed.
// * seeked: Fired when a seek operation completes
// * seeking: Fired when a seek operation begins
// * stalled: Fired when the user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
// * suspend: Fired when the media data loading has been suspended.
// * timeupdate: Fired when the time indicated by the currentTime attribute has been updated.
// * volumechange: Fired when the volume has changed.
// * waiting: Fired when playback has stopped because of a temporary lack of data.

/**
 * Eventos que podem ocorrer no player.
 * Eventos nativos de HTMLVideoElement, HTMLMediaElement e HTMLElement
 */
export const playerCustomEvents = ['retry'] as const;
export const playerEvents = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'play',
  'pause',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  // 'timeupdate',
  'volumechange',
  'waiting'
] as const;
export type PlayerEvents = typeof playerEvents[number];
export type PlaybackEvents = `player_${
  | typeof playerEvents[number]
  | typeof playerCustomEvents[number]}`;
