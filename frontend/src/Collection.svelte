<script>
  import { afterUpdate, onMount, tick } from "svelte";
  import { getCollection, loggedIn } from "./api.js";
  import { currentView, go } from "./navigation.js";
  import { get } from "svelte/store";
  import { onDestroy } from "svelte";
  import marked from "marked";

  let description = "";
  let offset = 0;
  let images = [];
  let collection = "home";
  let collectionThumb = false;
  let selectedImages = new Set();
  let IMAGE_URL = "//dev.himalayanacademy.com/hamsa-images";

  const selectImage = checksum => {
    selectedImages.add(checksum);
  };

  const unselectImage = checksum => {
    selectedImages.delete(checksum);
  };

  const refreshCollection = data => {
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
      document.title = `HAMSA - Search: ${data.query}`;
    }

    console.dir("getting collection", opts);
    getCollection(opts).then(data => {
      images = data.images;
    });
  };

  const getDescription = k => {
    let key = k
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "");
    let url = `//dev.himalayanacademy.com/hamsa-images/_texts/${key}.txt`;

    description = "";

    // fetch(url)
    //   .then(r => {
    //     console.log("collection", r)
    //     if (r.status !== 200) {
    //       throw "";
    //     } else {
    //       return r.text();
    //     }
    //   })
    //   .then(d => (description = marked(d)))
    //   .catch(e => {
    //     description = "";
    //   });
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

  const unsub = currentView.subscribe(i => {
    if (i.view == "Collection") {
      console.dir("view changed", i);
      refreshCollection(i.data);
    }
  });

  onDestroy(() => unsub());
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

  .editor-trigger {
    color: darkblue;
    font-size: 12px;
    cursor: pointer;
  }

  .checkbox {
    display: inline-flex;
    cursor: pointer;
    position: relative;
  }

  .checkbox > span {
    color: #34495e;
    padding: 0.5rem 0.25rem;
  }

  .checkbox > input {
    height: 25px;
    width: 25px;
    -webkit-appearance: none;
    -moz-appearance: none;
    -o-appearance: none;
    appearance: none;
    border: 1px solid #34495e;
    border-radius: 4px;
    outline: none;
    transition-duration: 0.3s;
    background-color: #41b883;
    cursor: pointer;
  }

  .checkbox > input:checked {
    border: 1px solid #41b883;
    background-color: #34495e;
  }

  .checkbox > input:checked + span::before {
    content: "\2713";
    display: block;
    text-align: center;
    color: #41b883;
    position: absolute;
    left: 0.5rem;
    top: 0.1rem;
  }

  .checkbox > input:active {
    border: 2px solid #34495e;
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
        <h3 class="collection-title">
          {collection}
          {#if $loggedIn}
            <span
              class="editor-trigger"
              on:click={() => {
                go('CollectionEditor', { images: [...selectedImages] });
              }}>
              (Edit Selected Images)
            </span>
          {/if}
        </h3>
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
    {:else if $loggedIn}
      <div class="collection-header">
        <h3 class="collection-title">
          <span
            class="editor-trigger"
            on:click={() => {
              go('CollectionEditor', { images: [...selectedImages] });
            }}>
            (Edit Selected Images)
          </span>
        </h3>
      </div>
    {/if}

    <div class="collection">
      <div class="collection-inner" />
      <section class="g">
        {#each images as item}
          <div class="gi">
            {#if $loggedIn}
              <label class="checkbox">
                <input
                  type="checkbox"
                  on:click|stopPropagation={ev => {
                    if (ev.target.checked) {
                      selectImage(item.checksum);
                    } else {
                      unselectImage(item.checksum);
                    }
                    console.log(selectedImages);
                  }} />
                <span />
              </label>
            {/if}
            <figure on:click={() => go('Image', { checksum: item.checksum })}>
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
