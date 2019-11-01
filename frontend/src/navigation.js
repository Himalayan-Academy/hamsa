import queryString from "query-string";
import { writable } from 'svelte/store';

export const currentView = writable({view: "Collection", data: {}});

export const go = (view, data) => {
    let qs = queryString.stringify({view, ...data})
    history.pushState({view, data}, `HAMSA - ${view}`,`index.html?${qs}`);
    currentView.set({view, data})
}

export const loadFromURL = () => {
    let qs = queryString.parse(location.search);
    let view = qs.view || "Collection"; 
    delete qs.view;
    go(view, qs)
}