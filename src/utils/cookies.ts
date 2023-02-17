/** COOKIES **/
export const setCookie = (cname, cvalue, exdays) => {
  var d = new Date(),
    expires;

  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);

  expires = 'expires=' + d.toUTCString();

  document.cookie = cname + '=' + cvalue + '; ' + expires;
};

export const getCookie = (cname) => {
  var name = cname + '=',
    ca = document.cookie.split(';'),
    i = 0,
    l = ca.length;

  for (; i < l; i++) {
    var c = ca[i];

    while (c.charAt(0) == ' ') c = c.substring(1);

    if (c.indexOf(name) == 0) {
      if (c.substring(name.length, c.length) === 'false') {
        return false;
      } else {
        return c.substring(name.length, c.length);
      }
    }
  }

  return false;
};
