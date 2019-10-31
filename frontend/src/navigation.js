import queryString from "query-string";
import { writable } from 'svelte/store';

export const currentView = writable({view: "Collection", data: {}});

export const go = (view, data) => {
    history.pushState({view, data}, `HAMSA - ${view}`);
    currentView.set({view, data})
}