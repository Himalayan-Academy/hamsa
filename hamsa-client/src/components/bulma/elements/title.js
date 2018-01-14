import m from "mithril"


export const Title = {
  view: (vnode) => {
    let size = vnode.attrs.size || 1;
    return m('h' + size + '.title' + '.is-' + size, vnode.children)
  }
}


export const SubTitle = {
  view: (vnode) => {
    let size = vnode.attrs.size || 1;
    return m('h' + size + '.subtitle' + '.is-' + size, vnode.children)
  }
}
