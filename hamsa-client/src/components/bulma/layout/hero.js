import m from "mithril";
import { Title, SubTitle } from "../elements/title.js";
import { Icon } from "../elements/icon.js";
import { Nav } from "../components/nav.js";

export const Hero = {
  view: vnode => [
    m('section.hero.is-primary.is-bold', [
      m('.hero-head', vnode.attrs.header),
      m('.hero-body', vnode.children),
      m('.hero-foot', vnode.attrs.footer)
    ])
  ]
}
