import m from "mithril"


const get_class = (vnode, item) => {
    let classes = vnode.attrs.tab ? 'is-tab' : ''
    if (item.hidden) classes +=  ' is-hidden' + item.hidden
    if (vnode.state.active === item.key) classes +=  ' is-active'
    return classes
}

const clickhandler = (vnode, item) =>
    () => {
        vnode.state.active = item.key
        if (vnode.attrs.onclick) vnode.attrs.onclick(item)
        if (item.onclick) item.onclick(item)
    }

export const NavbarToggle = {
    view: () => m('span.nav-toggle', m('span'), m('span'), m('span'))
}

export const NavbarItems = {
    oninit: vnode => vnode.state.active = vnode.attrs.active,
    view: vnode => vnode.attrs.items.map(item =>
        m('a.nav-item', {class: get_class(vnode, item), onclick: clickhandler(item)}, item.content))
}

export const NavbarMenu = {
  view: vnode => {
    let menu = [];

    if (vnode.attrs.start) {
      menu.push(m(".navbar-start", vnode.attrs.start.map(item => m("a.navbar-item", item))))
    }

    if (vnode.attrs.end) {
      menu.push(m(".navbar-end", vnode.attrs.end.map(item => m("a.navbar-item", item))))
    }

    return menu;
  }
}


export const NavbarBrand = {
  view: vnode => {
    let menu = [];

    if (vnode.attrs.brand) {
      menu.push(vnode.attrs.brand);
    }

    if (vnode.attrs.hamburger) {
      menu.push(m("button.button.navbar-burger", [
        m("span"),
        m("span"),
        m("span")
      ]));
    }

    return menu;
  }
}

export const Navbar = {
    view: vnode => m('nav.navbar', {class: vnode.attrs.shadow ? 'has-shadow': ""},
    [
        vnode.attrs.brand ? m(NavbarBrand, vnode.attrs) : "",
        vnode.attrs.menu ? m(NavbarMenu, {start: vnode.attrs.menu.start, end: vnode.attrs.menu.end}) : ""
    ])
}
