import m from "mithril";
import {CollectionLayout} from "./components/layouts/collection.js";

import "./scss/custom.scss";

m.route(document.body, "/", {
  "/": CollectionLayout,
})
