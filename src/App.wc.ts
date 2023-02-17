import App, { type Props } from './App.svelte';
import { register } from './core/SmartPlayer';

const tagName = 'my-project';

const availableProps: string[] = [];

!customElements.get(tagName) && register(tagName, App, availableProps);
