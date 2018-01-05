import m from "mithril"
import { Logo, MonasteryLogo } from './logos.js'

export const Header = {
  view: vnode => {
    return m("header", [
      m(Logo),
      m('div', {style:"flex: 1 1 auto"}, [
        m('h1.title', 'Himalayan Academy'),
        m('h2.subtitle', 'Art & Photo Collection')
      ]),
      m(MonasteryLogo)
    ])
  }
}
