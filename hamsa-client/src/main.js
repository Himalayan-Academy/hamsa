import m from "mithril";
import {CollectionLayout} from "./components/layouts/collection.js";

import "./scss/custom.scss";
import {SingleItemLayout} from "./components/layouts/single-item";

m.route(document.body, "/", {
  "/": CollectionLayout,
  "/image/:checksum": SingleItemLayout
});