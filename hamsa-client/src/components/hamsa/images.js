import m from 'mithril'

export const ImageWithLabel = {
  view: vnode => m("figure", [
    m('img.hero', {src: vnode.attrs.src}),
    m("span.label", m.trust(vnode.attrs.label))
  ])
}

export const MasonryTile = {
  view: vnode => m("div.tile", m("figure", [
    m('img', {src: vnode.attrs.src}),
    m("p", m.trust(vnode.attrs.label))
  ]))
}

