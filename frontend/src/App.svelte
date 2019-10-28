<script>
  import Header from "./Header.svelte";
  import Hero from "./Hero.svelte";
  import SelectorControls from "./SelectorControls.svelte";
  import InfoPage from "./InfoPage.svelte";
  import Collection from "./Collection.svelte";
  import queryString from "query-string";
  import { currentView } from "./navigation.js";

  const views = {
    InfoPage: InfoPage,
    Collection: Collection
  };

  history.pushState({view: currentView.view, data: currentView.data}, currentView.view);

  const pop = d => {
    currentView.set(d.state);
  };

</script>

<svelte:window on:popstate={pop} />
<div>
  <Header />
  <Hero />
  <SelectorControls />
  <svelte:component this={views[$currentView.view]} {...$currentView.data} />
</div>
