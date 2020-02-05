<script>
  import {
    getImage,
    login,
    addImageTag,
    removeImageTag,
    getSelectors,
    setImageDescription,
    setImageCaption,
    getImagesForCollectionEditor
  } from "./api.js";
  import { currentView, go } from "./navigation.js";
  import { onDestroy } from "svelte";

  let loadingImages = true;
  let collections;
  let tags;
  let newTag = "";
  let images = [];
  let IMAGE_URL = "//dev.himalayanacademy.com/hamsa-images";

  const addTag = () => {}

  const thumbnailToURL = t => {
    let i = t.replace("/images/", "");
    return `${IMAGE_URL}/${i}`;
  };

  const unsub = currentView.subscribe(i => {
    console.dir("view changed", i);
    if (i.view == "CollectionEditor") {
      getSelectors().then(selectors => {
        tags = selectors.keywords;
        collections = selectors.collections;
        images = i.data.images;
        console.log(images);
        getImagesForCollectionEditor(images).then(r => {
          console.log("result", r);
          images = images.map((c, i) => {
            return r[`i${i}`];
          });
          console.log("images", images);
          loadingImages = false;
        });
      });
    }
  });

  onDestroy(() => unsub());
</script>

<style>
  .images {
    background-color: #d8b36c;
    max-width: 50%;
  }
  .images figure {
    width: 100px;
    display: inline-block;
  }

  img {
    max-width: 100%;
  }

  .editor {
    display: flex;
  }

  .controls {
    padding: 25px;
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

  p.error {
    color: red;
  }

  .collection-label {
    display: inline-block;
  }
</style>

{#if loadingImages}
  <div class="loading-wrapper">
    <i class="fa fa-spinner fa-spin fa-3x" />
  </div>
{:else}
  <div class="editor">
    <div class="images">
      {#each images as image}
        {#if typeof image == 'string'}
          <figure>
            <i class="fa fa-spinner fa-spin" />
          </figure>
        {:else}
          <figure>
            <img src={thumbnailToURL(image.thumbnail)} alt="" />
          </figure>
        {/if}
      {/each}
    </div>
    <div class="controls">
    {#if tags}
        <div class="collection-header">
          <h3 class="collection-title">Tags</h3>
          <p>
            The tags you add here will be added to the images
            appearing on the left.
          </p>
        </div>
        <form on:submit|preventDefault={addTag}>
              <label for="newtag">New Tag:</label>
              <input type="text" list="tag-list" id="newtag" bind:value={newTag} />
              <datalist id="tag-list">
              {#each tags as tag}
              <option value="{tag}">
              {/each}
              </datalist>
              <input type="submit" value="Add tag" />
            </form>
      {/if}
      {#if collections}
        <div class="collection-header">
          <h3 class="collection-title">Collections</h3>
          <p>
            All the collections you select here will be added to the images
            appearing on the left.
          </p>
        </div>
        {#each collections as collection, i}
          <div>
            <input
              type="checkbox"
              on:change={ev => updateCollection(ev, collection, i)}
              name="collection-{i}" />
            <label class="collection-label" for="collection-{i}">
              {collection}
            </label>
          </div>
        {/each}
        <button>Add images to the selected collections</button>
      {/if}
      
    </div>
  </div>
{/if}
