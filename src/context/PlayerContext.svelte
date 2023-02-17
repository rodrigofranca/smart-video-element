<script lang="ts" context="module">
  export type PlayerContext = {
    player: Writable<Player>;
    playback: Writable<Playback>;
    bitrate: Writable<BitrateLevelSwitch>;
    subtitleText: Writable<string>;
    subtitle: Writable<Subtitle>;
    videoEl: Writable<HTMLVideoElement>;
    /**
     * Store que armazena as legendas disponíveis
     * - É alimentada pela api do fantascope ou pelo manifesto hls/dash
     */
    subtitles: Writable<Subtitle[]>;
    /**
     * Store que armazena os HTMLTrackElement gerados a partir de cada `subtitle`
     */
    tracks: Writable<NodeListOf<HTMLTrackElement>>;
    getVideo: () => HTMLVideoElement;
    changeBitrate: (index: BitrateLevel['index']) => void;
    changeAudioTrack: (index: number) => void;
    changeSubtitle: (index: number) => void;
  };
  export type Subtitle = {
    id: number;
    index: number;
    name: string;
    lang: string;
    src: string;
    default: boolean;
  };
</script>

<script lang="ts">
  import type Player from '$/lib/Player.svelte';
  import type { Playback } from '$/model/Playback';
  import type { BitrateLevel, BitrateLevelSwitch } from '$/model/Player';
  import { onDestroy, setContext } from 'svelte';
  import { writable, type Writable } from 'svelte/store';

  let playback = writable(null as Playback);
  let bitrate = writable(null as BitrateLevelSwitch);
  let subtitleText = writable(null as string);
  let subtitle = writable(null as Subtitle);
  let subtitles = writable(null as Subtitle[]);
  let tracks = writable<NodeListOf<HTMLTrackElement>>([] as null);
  let videoEl = writable<HTMLVideoElement>(null as HTMLVideoElement);
  let player = writable(null as Player);

  let _player: Player;
  export { _player as player };

  setContext<PlayerContext>('player', {
    player,
    playback,
    bitrate,
    subtitleText,
    subtitle,
    subtitles,
    tracks,
    videoEl,
    getVideo: () => _player?.getVideoTag(),
    changeBitrate: (index) => _player?.changeBitrate && _player?.changeBitrate(index),
    changeAudioTrack: (index) => _player?.changeAudioTrack && _player?.changeAudioTrack(index),
    changeSubtitle: (index) => _player?.changeSubtitle && _player?.changeSubtitle(index)
  });

  const handleBitrateChange = ({ detail }) => {
    const bitrateLevel = detail as BitrateLevelSwitch;
    bitrate.set(bitrateLevel);
  };
  const handleSubtitleChange = ({ detail }) => {
    // console.log('subtitlechange', detail);
    // const textTrack = player.video.addTextTrack('subtitles', 'test', 'en');
    // (detail.cues as VTTCue[]).forEach((cue) => {
    //   textTrack.addCue(cue);
    // });
    // textTrack.oncuechange = () => {
    //   console.log('cue chaaaaaaange----');
    // };
    // textTrack.addCue
  };

  onDestroy(() => {
    _player?.$destroy();
  });

  $: if (_player) {
    _player.$on('bitrateChange', handleBitrateChange);
    _player.$on('subtitleChange', handleSubtitleChange);
    player.set(_player);
  }
  $: if ($playback) {
    subtitles.set(null);
  }
</script>

<slot />
