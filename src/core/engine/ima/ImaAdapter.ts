import { configAds } from '$/constants';
import IMASdk, { type ImaParams } from './IMASdk';
import * as qs from '$/utils/qs';
import { googleAdTags } from '$/store/Ads';
import type { Media } from '$/model/Media';

type ImaAdTagConfig = {
  // codProfile: string,
  // tags: string,
  type: Media['type'];
  iuDFP: string;
  size: string;
  mediaId: string;
  url: string;
};

const customAdTag = () => {
  if ((window as any)?.DYNAD_TV?.config?.URL_VAST) {
    const adTag = (window as any)?.DYNAD_TV?.config?.URL_VAST;
    console.log('[UOLPlayer] usando url VAST customizada: ' + adTag);
    return adTag;
  } else {
    return undefined;
  }
};

export default class ImaAdapter {
  static forcedfp = qs.get('forcedfp');

  static createAdTag(config: ImaAdTagConfig) {
    if (this.forcedfp && googleAdTags[this.forcedfp])
      return googleAdTags[this.forcedfp];

    let _customAdTag = customAdTag();
    if (_customAdTag) {
      console.warn(
        '[FantascopePlayer] usando url VAST customizada: ' + _customAdTag
      );
      return _customAdTag;
    }

    if (!config.iuDFP) {
      console.warn('[FantascopePlayer] DFP desligado');
      return undefined;
    }

    let customDataLayer = '',
      customParam = {},
      urlDFP = '',
      iuDFP = config.iuDFP,
      videoplayertype = '%26videoplayertype%3Dhtml5',
      keyword =
        config.type === 'stream'
          ? configAds.keywords.live
          : configAds.keywords.vod;

    customParam = videoplayertype + keyword + customDataLayer;

    urlDFP =
      'https://' +
      'pubads.g.doubleclick.net/gampad/ads?' +
      'sz=' +
      (config.size || '640x480') +
      '&gdfp_req=1' +
      '&iu=' +
      iuDFP +
      '&ciu_szs=300x250' +
      '&url=[referrer_url]' +
      '&correlator=[timestamp]' +
      '&env=vp' +
      '&unviewed_position_start=1' +
      '&output=vast' +
      '&impl=s' +
      '&vid=' +
      config.mediaId +
      '&description_url=' +
      config.url +
      '&cust_params=' +
      customParam;

    console.log('[FantascopePlayer] DFP adTag: ' + urlDFP);

    return urlDFP;
  }

  static create(params: ImaParams, adTagConfig: ImaAdTagConfig) {
    params.tag = this.createAdTag(adTagConfig);

    if (params.tag) return new IMASdk(params);

    return null;
  }
}
