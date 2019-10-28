import queryString from "query-string";
import { writable } from 'svelte/store';

export const currentView = writable({view: "Collection", data: {}});

export const go = (view, data) => {
    currentView.set({view, data})
}