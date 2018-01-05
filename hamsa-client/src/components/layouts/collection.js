import m from "mithril";
import * as hamsa from "../hamsa";
import { imageModel } from "../../models/image";

export const CollectionLayout = {
    images: [],
    oninit: vnode => {
        imageModel.getAvailableImages()
            .then(images => vnode.state.images = images);
    },
    view: vnode => [
        m(hamsa.Header),
        m(hamsa.Hero),
        m(hamsa.Masonry, {images: vnode.state.images})
    ]
}
