import type { Drm } from './Drm';

export interface Size {
  width: number;
  height: number;
}
export interface Duration {
  milliseconds: number;
}
export interface DurationRange {
  start: number;
  end: number;
}
export type PlayerParams = {
  video: HTMLVideoElement;
  src: string;
  alternatives?: string[];
  controls?: boolean;
  autoplay?: boolean;
  position?: number;
  volume?: number;
  muted?: boolean;
  playsInline?: boolean;
  isLive?: boolean;
} & {
  drm?: Drm;
};
export type PlayerAction = 'play' | 'pause' | 'stop' | 'seek';

export type QualityLevel = {
  id: number;
  index: number;
  resolution: number;
  bandwidth: number;
};

export type BitrateLevel = {
  id: number;
  index: number;
  resolution: number;
  bitrate: number;
};

export type AudioTrackLevel = {
  id: number;
  index: number;
  name: string;
  lang: string;
};

export interface IPlayer extends Partial<PlayerParams> {
  duration?: number;
  size?: Size;
  buffered?: DurationRange[];
  isPlaying?: boolean;
  isLooping?: boolean;
  isBuffering?: boolean;
  errorDescription?: string;
  aspectRatio?: number;
  initialized?: boolean;
  hasError?: boolean;
  initialize(): void;
  destroy(): void;
  play(): void; //TODO: Retornar promise
  pause(): void;
  seek(time: number): void;
  toggleMute(): void;
  handleAutoplay(): void;
  canAutoplay(): Promise<boolean>;
  canMutedAutoplay(): Promise<boolean>;
  changeBitrate(index: BitrateLevel['index']): void;
  changeSubtitle(index: number): void;
}

export type BitrateLevelSwitch = {
  auto: boolean;
  level: number;
};
