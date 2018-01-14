import m from 'mithril';
import {ImageWithLabel} from "./images.js"

export const Hero = {
  view: vnode => m(".hero", [
    m(ImageWithLabel, {src: "resources/MWS00SelfGod.jpg", label: "Self God"})
  ])
}
