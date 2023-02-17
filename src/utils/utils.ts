export const delay = (time: number) => {
  return new Promise((res) => {
    setTimeout(res, time);
  });
};

export const anyToBoolean = (value: any) => isNullOrUndefined(value);
export const stringToBoolean = (value: any) =>
  (value + '').toLowerCase() === 'true';
export const isNullOrUndefined = (value: any): boolean =>
  value === null || value === undefined;
export const replaceServer = (url: string, server: string) =>
  url.replace(/^(https?:)?(\/\/)?(.+?)\//im, '//' + server + '/');
export const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

export const info = (() => {
  var unknown = '-';

  // browser
  let nVer = navigator.appVersion;
  let nAgt = navigator.userAgent;
  let majorVersion = parseInt(navigator.appVersion, 10);
  let version = '' + parseFloat(navigator.appVersion);
  let browser = navigator.appName;
  let connectionType =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection ||
    undefined;
  //@ts-ignore
  let nameOffset,
    verOffset,
    ix,
    match,
    osVersion: any = unknown,
    osMajorVersion,
    mobile,
    os = unknown,
    clientStrings;

  if (!!connectionType) {
    if (connectionType.type) connectionType = connectionType.type;
    else if (connectionType.effectiveType)
      connectionType = connectionType.effectiveType;
    else connectionType = undefined;
  }

  // Opera
  if ((verOffset = nAgt.indexOf('Opera')) != -1) {
    browser = 'Opera';
    version = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf('Version')) != -1) {
      version = nAgt.substring(verOffset + 8);
    }
  }
  // Instant Article
  if ((match = nAgt.match(/\[(FBAN|FB_IAB|FBIAB|FBIA)\//)) != null) {
    browser = 'Facebook Instante Article';
    verOffset = nAgt.indexOf('FBAV/') + 5;
    version = nAgt.substring(verOffset);
  }
  // Opera TV
  else if ((verOffset = nAgt.indexOf('Presto/')) != -1) {
    browser = 'Opera Presto';
    version = nAgt.substring(verOffset + 7);
  }
  // Edge
  else if ((verOffset = nAgt.indexOf('Edg')) != -1) {
    browser = 'Edge';
    version = nAgt.substring(verOffset + 4);
  }
  // Opera Next
  else if ((verOffset = nAgt.indexOf('OPR')) != -1) {
    browser = 'Opera';
    version = nAgt.substring(verOffset + 4);
  }
  // MSIE
  else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
    browser = 'Microsoft Internet Explorer';
    version = nAgt.substring(verOffset + 5);
  }
  // Chrome
  else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
    browser = 'Chrome';
    version = nAgt.substring(verOffset + 7);
  }
  // Safari
  else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
    browser = 'Safari';
    version = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf('Version')) != -1) {
      version = nAgt.substring(verOffset + 8);
    }
  }
  // Firefox
  else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
    browser = 'Firefox';
    version = nAgt.substring(verOffset + 8);
  }
  // MSIE 11+
  else if (nAgt.indexOf('Trident/') != -1) {
    browser = 'Microsoft Internet Explorer';
    version = nAgt.substring(nAgt.indexOf('rv:') + 3);
  }
  // Search Bots
  else if (nAgt.indexOf('http:') != -1 || nAgt.indexOf('https:') != -1) {
    browser = nAgt.match(/https?:\/\/([\w\._-]+)/).pop();
    version = nAgt.substring(nAgt.indexOf('(') + 1);
    version = version.substring(version.indexOf('/') + 1);
  }
  // Other browsers
  else if (
    (nameOffset = nAgt.lastIndexOf(' ') + 1) <
    (verOffset = nAgt.lastIndexOf('/'))
  ) {
    browser = nAgt.substring(nameOffset, verOffset);
    version = nAgt.substring(verOffset + 1);
    if (browser.toLowerCase() == browser.toUpperCase()) {
      browser = navigator.appName;
    }
  }
  // trim the version string
  if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
  if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
  if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

  majorVersion = parseInt('' + version, 10);
  if (isNaN(majorVersion)) {
    version = '' + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }

  // mobile version
  mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

  // system
  os = unknown;
  clientStrings = [
    { s: 'Windows Phone 10', r: /(Windows Phone 10)/ },
    { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
    { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
    { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
    { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
    { s: 'Windows Vista', r: /Windows NT 6.0/ },
    { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
    { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
    { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
    { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
    { s: 'Windows 98', r: /(Windows 98|Win98)/ },
    { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
    { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
    { s: 'Windows CE', r: /Windows CE/ },
    { s: 'Windows 3.11', r: /Win16/ },
    { s: 'Android', r: /Android/ },
    { s: 'Open BSD', r: /OpenBSD/ },
    { s: 'Sun OS', r: /SunOS/ },
    { s: 'Linux', r: /(Linux|X11)/ },
    { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
    { s: 'Mac OS X', r: /Mac OS X/ },
    { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
    { s: 'QNX', r: /QNX/ },
    { s: 'UNIX', r: /UNIX/ },
    { s: 'BeOS', r: /BeOS/ },
    { s: 'OS/2', r: /OS\/2/ },
    {
      s: 'Search Bot',
      r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver|BingPreview|https?:\/\/)/
    }
  ];
  for (var id in clientStrings) {
    var cs = clientStrings[id];
    if (cs.r.test(nAgt)) {
      os = cs.s;
      break;
    }
  }

  if (/Windows/.test(os)) {
    osVersion = /Windows (.*)/.exec(os) ? /Windows (.*)/.exec(os)[1] : '';
    os = 'Windows';
  }

  const osInfo = async (os) => {
    let osVersion, osMajorVersion;
    switch (os) {
      case 'Windows':
        const ua = await (navigator as any).userAgentData.getHighEntropyValues([
          'architecture',
          'model',
          'platform',
          'platformVersion',
          'uaFullVersion'
        ]);
        if (parseInt(ua['platformVersion']) >= 14) {
          osVersion = 11;
        }
        break;
      case 'Mac OS X':
        osVersion = /Mac OS X ([\.\_\d]+)/.exec(nAgt)
          ? /Mac OS X ([\.\_\d]+)/.exec(nAgt)[1]
          : '';
        break;
      case 'Android':
        osVersion = /Android ([\.\_\d]+)/.exec(nAgt)
          ? /Android ([\.\_\d]+)/.exec(nAgt)[1]
          : '';
        break;
      case 'iOS':
        osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
        osVersion = osVersion
          ? osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0)
          : '';
        break;
    }
    osMajorVersion = parseInt('' + osVersion, 10);

    return {
      version: osVersion,
      majorVersion: osMajorVersion
    };
  };

  return {
    browser: browser,
    browserVersion: version,
    browserMajorVersion: majorVersion,
    mobile: mobile,
    os: os,
    osVersion: osVersion,
    osMajorVersion: osMajorVersion,
    connectionType: connectionType,
    userAgent: navigator.userAgent.replace(/["',&-]/gi, ''),
    getOsVersion: () => osInfo(os)
  };
})();

export const isIOS = info.os.match(/ios/i) !== null;
export const isEdge = info.browser.match(/Edge/i) !== null;
export const isSafari =
  navigator.userAgent.toLowerCase().indexOf('safari') > -1 &&
  navigator.userAgent.toLowerCase().indexOf('mac') > -1 &&
  navigator.userAgent.toLowerCase().indexOf('chrome') == -1;
