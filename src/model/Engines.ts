import type DashJsAdapter from '$/core/engine/dash/DashJsAdapter';
import type HlsJsAdapter from '$/core/engine/hls/HlsJsAdapter';
import type PlayerAdapter from '$/core/PlayerAdapter';

export type Engines = 'dashjs' | 'hlsjs' | 'simple';
export type EngineAdapter = {
  dashjs: typeof DashJsAdapter;
  hlsjs: typeof HlsJsAdapter;
  simple: typeof PlayerAdapter;
};
