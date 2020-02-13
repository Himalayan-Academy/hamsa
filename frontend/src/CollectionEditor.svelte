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
  let addingTag = false;
  let collections;
  let tags;
  let newTag = "";
  let images = [];
  let IMAGE_URL = "//dev.himalayanacademy.com/hamsa-images";
  let email;
  let password;

  const savedCredentials = () => {
    if (
      sessionStorage.getItem("email") !== null &&
      sessionStorage.getItem("password") !== null
    ) {
      email = sessionStorage.getItem("email");
      password = sessionStorage.getItem("password");
      return true;
    } else {
      return false;
    }
  };

  const updateCollection = (ev, collection, i) => {
    if (ev.target.checked) {
      newTag = collection;
    } 
    console.log()
  };

  const addCollection = () => {
    if (newTag.length <= 2) {
      alert("Can't add collections that short.");
      return false;
    }

    addingTag = true;
    newTag = `Collection ${newTag}`;

    let res = images.map(i => addImageTag(email, password, i.checksum, newTag));

    Promise.all(res)
      .then(res2 => {
        console.log(res2)
        console.log("images old", images)
        images = res2.map(r => r.addImageTag)
        console.log("images new", images)

        let snip = images.map(i=> `&images=${i.checksum}`).join("")

        history.replaceState(
            { images },
            `Editing Images: ${images}`,
            `${location.pathname}?view=CollectionEditor${snip}`
          );

        getSelectors().then(selectors => {
          tags = selectors.keywords;
          collections = selectors.collections;
          addingTag = false;
        });

        newTag = "";
      })
      .catch(n => {
        console.error(n);
        error = n.map(e => e.message).join(`. `);
        addingTag = false;
      });
  };

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

  savedCredentials();

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
          <h3 class="collection-title">Add new collection</h3>
          <p>
            The collections you add here will be added to the images appearing
            on the left.
          </p>
        </div>
        {#if addingTag}
          <i class="fa fa-spinner fa-spin" />
        {:else}
          <form on:submit|preventDefault={addCollection}>
            <label for="newtag">Add New Collection:</label>
            <input type="text" id="newtag" bind:value={newTag} />
            <input type="submit" value="Assign collection" />
          </form>
        {/if}
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
              type="radio"
              name="collection"
              on:change={ev => updateCollection(ev, collection, i)}
              id="collection-{i}" />
            <label class="collection-label" for="collection-{i}">
              {collection}
            </label>
          </div>
        {/each}
        {#if addingTag}
          <i class="fa fa-spinner fa-spin" />
        {:else}
          <button on:click={addCollection}>
            Assign the selected collections to the images on the left
          </button>
        {/if}
      {/if}

    </div>
  </div>
{/if}
