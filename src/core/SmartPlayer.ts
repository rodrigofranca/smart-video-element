import { isNullOrUndefined } from '../utils';

export function SmartPlayer<T>(tagName, Component: any, props: string[] = []) {
  class SmartPlayer extends HTMLElement {
    target: ShadowRoot;
    data: {};
    instance: any;
    nativeEl: HTMLVideoElement;
    constructor() {
      super();
      this.target = this.attachShadow({ mode: 'open' });
      this.data = {};
    }

    connectedCallback() {
      props.forEach((prop) => {
        const value = this[prop];
        if (!isNullOrUndefined(value)) {
          this.data[prop] = value === '' ? true : value === false ? null : value;
        }
      });
      this.instance = new Component({
        target: this.target,
        props: this.data
      });
      props.forEach((prop) => {
        this.instance.$on(prop, (value) => {
          this.setAttribute(prop, value?.detail || value);
        });
      });
    }

    detachedCallback() {
      this.instance.$destroy();
      this.instance = null;
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      let value = isNaN(newValue) ? newValue : +newValue;
      try {
        value = JSON.parse(value);
      } catch (error) {}
      this.data[attr] = value;
      if (this.instance) this.instance.$set({ [attr]: value });
    }
  }

  Object.defineProperty(SmartPlayer, 'observedAttributes', {
    get() {
      return props;
    }
  });

  // Map all native element properties to the custom element
  // so that they're applied to the native element.
  // Skipping HTMLElement because of things like "attachShadow"
  // causing issues. Most of those props still need to apply to
  // the custom element.
  // But includign EventTarget props because most events emit from
  // the native element.
  let nativeElProps = [];

  // Can't check typeof directly on element prototypes without
  // throwing Illegal Invocation errors, so creating an element
  // to check on instead.
  const nativeElTest = document.createElement('video');

  // Deprecated props throw warnings if used, so exclude them
  const deprecatedProps = ['webkitDisplayingFullscreen', 'webkitSupportsFullscreen'];

  // Walk the prototype chain up to HTMLElement.
  // This will grab all super class props in between.
  // i.e. VideoElement and MediaElement
  for (
    let proto = Object.getPrototypeOf(nativeElTest);
    proto && proto !== HTMLElement.prototype;
    proto = Object.getPrototypeOf(proto)
  ) {
    Object.keys(proto).forEach((key) => {
      if (deprecatedProps.indexOf(key) === -1) {
        nativeElProps.push(key);
      }
    });
  }

  // For the video element we also want to pass through all event listeners
  // because all the important events happen there.
  nativeElProps = nativeElProps.concat(Object.keys(EventTarget.prototype));

  arrayUnique(props.concat(nativeElProps)).forEach((prop) => {
    const type = typeof nativeElTest[prop];

    if (type === 'function') {
      SmartPlayer.prototype[prop] = function () {
        return this.instance.video[prop].apply(this.instance.video, arguments);
      };
    } else {
      Object.defineProperty(SmartPlayer.prototype, prop, {
        get() {
          return this.instance?.video[prop] ?? this.data[prop];
        },
        set(value) {
          this.data[prop] = value;
          if (this.instance) {
            this.instance.$$set({ [prop]: value });
            this.instance.video[prop] = value;
          }
        }
      });
    }
  });

  if (!window.customElements.get(tagName)) {
    window.customElements.define(tagName, SmartPlayer);
  }

  return SmartPlayer;
}

function arrayUnique(array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) a.splice(j--, 1);
    }
  }

  return a;
}
