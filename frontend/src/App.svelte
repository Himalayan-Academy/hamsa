<script>
  import Header from "./Header.svelte";
  import Hero from "./Hero.svelte";
  import SelectorControls from "./SelectorControls.svelte";
  import InfoPage from "./InfoPage.svelte";
  import Collection from "./Collection.svelte";
  import Image from "./Image.svelte";
  import ImageEditor from "./ImageEditor.svelte";
  import CollectionEditor from "./CollectionEditor.svelte";
  import queryString from "query-string";
  import { currentView, loadFromURL } from "./navigation.js";

  const views = {
    InfoPage: InfoPage,
    Collection: Collection,
    CollectionEditor: CollectionEditor,
    Image: Image,
    ImageEditor: ImageEditor
  };

  loadFromURL();

  const pop = d => {
    currentView.set(d.state);
  };
</script>

<svelte:window on:popstate={pop} />
<div>
  <Header />
  <Hero />
  <SelectorControls />
  <svelte:component this={views[$currentView.view]} />
</div>
