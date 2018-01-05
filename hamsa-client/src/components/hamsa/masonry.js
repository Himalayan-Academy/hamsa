import m from "mithril";
import { MasonryTile } from "./images.js"

export const Masonry = {
    images: [],
    oninit: vnode => {
        vnode.state.images = vnode.attrs.images;
    },
    onbeforeupdate: vnode => {
        console.log("update", vnode.state.images);
        console.log("attrs", vnode.attrs.images);
        vnode.state.images = vnode.attrs.images;
    },
    view: vnode => m("div.collection", [
        m("h1", "Collection"),
        m("section.masonry", vnode.state.images.length > 0 ? vnode.state.images.map(image => {
                console.log("thumb", image.thumbnail);
                var t = "http://localhost:8080" + image.thumbnail;
                return m(MasonryTile, {src: t, label: "Self God"})
            })
            :
            m("h1", "Loading")
        )
    ])
};
