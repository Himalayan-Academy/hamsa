import m from "mithril";
import * as hamsa from "../hamsa";
import { imageModel } from "../../models/image";

export const SingleItemLayout = {
    image: false,
    oninit: vnode => {
        checksum = m.route.param("checksum")
        imageModel.getImage(checksum)
            .then(image => {
                console.log(image);
                vnode.state.image = image;
            });
    },
    view: vnode => [
        m(hamsa.Header),
        m("figure", [
            m("img.is-single-item-display", {src: "http://localhost:8080" + vnode.state.image.path }),
            m("p", m.trust(vnode.attrs.label))
        ])

    ]
};
