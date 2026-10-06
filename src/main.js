// start of the app load the shared look colors and fonts then draw the whole interface into the page
import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';

export default mount(App, { target: document.getElementById('app') });
