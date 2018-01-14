import m from 'mithril'

export const ImageWithLabel = {
    view: vnode => m("figure", [
        m('img.hero', {src: vnode.attrs.src}),
        m("span.label", m.trust(vnode.attrs.label))
    ])
};

export const MasonryTile = {
    showImage: function (vnode) {
        console.log("should show image", vnode.attrs.checksum)
    },
    view: vnode => m("div.tile", m("figure", [
        m('img', {src: vnode.attrs.src, onclick: () => { m.route.set("/image/" + vnode.attrs.checksum)}}),
        m("p", m.trust(vnode.attrs.label))
    ]))
};

