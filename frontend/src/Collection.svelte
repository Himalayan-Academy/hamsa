<script>
  import { afterUpdate, onMount, tick } from "svelte";
  import { getCollection } from "./api.js";
  import { currentView } from "./navigation.js";
  import { get } from "svelte/store";
  import marked from "marked";

  let description = "";
  let offset = 0;
  let IMAGE_URL = "//dev.himalayanacademy.com/hamsa-images";
  let images = [];
  let collection = "home";
  let collectionThumb = false;

  const refreshCollection = data => {
    console.dir("refresh", data);
    let opts = {};
    images = [];
    collectionThumb = false;
    description = "";

    if (!data) {
      return false;
    }

    opts = { limit: 50, offset };

    if (data.collection && data.collection !== "home") {
      let keyword = `Collection ${data.collection}`;
      opts.keyword = keyword;
      collection = data.collection;
      getDescription(keyword);
      document.title = `HAMSA - collection: ${keyword}`;
    }

    if (data.keyword) {
      opts.keyword = data.keyword;
      collection = data.keyword;
      getDescription(data.keyword);
      document.title = `HAMSA - tag: ${data.keyword}`;
    }

    if (data.artist) {
      opts.artist = data.artist;
      collection = data.artist;
      getDescription(data.artist);
      getCollectionThumb(data.artist);
      document.title = `HAMSA - Artist: ${data.artist}`;
    }

    if (data.query) {
      opts.query = data.query;
      collection = data.query;
      document.title = `HAMSA - Search: ${data.query}`
    }

    console.dir("getting collection", opts);
    getCollection(opts).then(data => {
      images = data.images;
      console.log("images", images);
    });
  };

  currentView.subscribe(i => {
    console.dir("view changed", i);
    refreshCollection(i.data);
  });

  const getDescription = k => {
    let key = k
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "");
    let url = `//dev.himalayanacademy.com/hamsa-images/_texts/${key}.txt`;

    fetch(url)
      .then(d => d.text())
      .then(d => (description = marked(d)));
  };

  const getCollectionThumb = k => {
    let key = k
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "");
    collectionThumb = `//dev.himalayanacademy.com/hamsa-images/_artists/${key}.jpg`;
  };

  const thumbnailToURL = t => {
    let i = t.replace("/images/", "");
    return `${IMAGE_URL}/${i}`;
  };
</script>

<style>
  .no-collection {
    text-align: center;
    font-size: 1.6em;
    color: #a76b73;
  }

  .collection-header {
    text-align: center;
  }

  .collection-title {
    color: #a76b73;
    border-bottom: solid 1px #919191;
    padding-bottom: 10px;
    display: inline-block;
  }

  .collection-inner {
    text-align: center;
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
  }

  .collection-description {
    color: #333;
    text-align: left;
    padding-left: 15px;
  }

  .collection-metadata {
    display: flex;
    margin-bottom: 30px;
    margin: auto;
    width: 90%;
    justify-content: center;
  }

  .collection-metadata > img {
    max-width: 300px;
    height: auto;
    margin: 10px;
  }

  .g {
    /* Masonry container */
    column-count: 3;
    column-gap: 1em;
  }

  .gi {
    /* Masonry bricks or child elements */
    display: inline-block;
    margin: 0 0 0.5em;
    width: 100%;
  }

  .gi figure:hover {
    cursor: pointer;
  }

  .gi figure img {
    max-width: 100%;
  }

  .hidden {
    display: none;
  }
</style>

<div>
  {#if images.length == 0}
    <div class="loading-wrapper">
      <i class="fa fa-spinner fa-spin fa-3x" />
    </div>
  {:else}
    {#if collection !== 'home'}
      <div class="collection-header">
        <h3 class="collection-title">{collection}</h3>
        <div class="collection-metadata">
          {#if collectionThumb}
            <img
              src={collectionThumb}
              on:error={() => (collectionThumb = false)}
              class:hidden={!collectionThumb}
              alt="photo: {collection}" />
          {/if}
          <p class="collection-description">
            {@html description}
          </p>
        </div>
      </div>
    {/if}
    <div class="collection">
      <div class="collection-inner" />
      <section class="g">
        {#each images as item}
          <div class="gi">
            <figure>
              <img src={thumbnailToURL(item.thumbnail)} alt="" />
            </figure>
          </div>
        {:else}
          <p class="no-collection">
            Sorry but we couldn't find images related to {collection}.
          </p>
        {/each}
      </section>
    </div>
  {/if}
</div>
