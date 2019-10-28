<script>
    import {afterUpdate, onMount, tick} from "svelte";
    import {getCollection} from "./api.js";

    export let name = "home";

    let description = "";
    let offset = 0;
    let IMAGE_URL = "http://dev.himalayanacademy.com/hamsa-images";
    let collection = [];

    onMount( async () => {
        let {images} = await getCollection({limit: 50, offset});
        collection = images;
    })

    const thumbnailToURL = (t) => {
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

    .g { /* Masonry container */
      column-count: 3;
      column-gap: 1em;
  }

  .gi { /* Masonry bricks or child elements */
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

</style>

<div>
  {#if collection.length == 0}
  <div class="loading-wrapper">
      <i class="fa fa-spinner fa-spin fa-3x"></i>
  </div>
  {:else}
  {#if name !== "home"}
  <div class="collection-header">
    <h3 class="collection-title">{name}</h3>
    <p class="collection-description">{description}</p>
</div>
{/if}
<div class="collection">
  <div class="collection-inner"></div>
  <section class="g">
    {#each collection as item}
    <div class="gi">
        <figure><img src="{thumbnailToURL(item.thumbnail)}" alt=""></figure>
    </div>
    {:else}
    <p class="no-collection">
        Sorry but we couldn't find images related to {name}.
    </p>
    {/each}
</section>
</div>
{/if}
</div>