import m from 'mithril'

export const Logo = {
  view: vnode => m('img.hamsa-logo[src=images/hamsa-logo.jpg]', {click: ev => m.route.set("/")})
}

export const MonasteryLogo = {
  view: vnode => m('img.monastery-logo[src=images/monastery-logo.png]')
}
