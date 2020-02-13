<script>
  import {
    getImage,
    login,
    addImageTag,
    removeImageTag,
    getSelectors,
    setImageDescription,
    setImageCaption
  } from "./api.js";
  import { currentView, go } from "./navigation.js";
  import { onDestroy } from "svelte";

  // problem with f3a129ffe45a292771e1e15e4c0ecd45
  /*
  check sum changes with editing, need to take that into account.
  */

  export let checksum;

  let image = {};
  let loading = true;
  let addingTag = false;
  let updatingText = false;
  let IMAGE_URL = "//dev.himalayanacademy.com/hamsa-images";
  let error = false;
  let email;
  let password;
  let loggedIn = false;
  let newTag;

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

  const refreshImage = data => {
    checksum = data.checksum;
    loading = true;
    getImage({ checksum }).then(res => {
      image = res.image;
      activeCollections = collections.map(c => image.metadata.keywords.includes(`Collection ${c}`))
      if (image.metadata.description.length > 0) {
        description = image.metadata.description;
      }

      if (image.metadata.caption.length > 0) {
        caption = image.metadata.caption;
      }

      loading = false;
    });
  };

  const testAndSaveLogin = async () => {
    if (await login(email, password)) {
      console.log(`user ${email} logged in.`);
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("password", password);
      error = false;
      loggedIn = true;
    } else {
      console.log(`Bad login credentials.`);
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("password");
      error = "Not a valid user.";
      loggedIn = false;
    }
  };

  const toFilename = path => {
    return "image.jpg";
  };

  const toImageURL = url => {
    let i = url
      .replace("/images/", "")
      .replace("/home/devhap/public_html/hamsa-images", "");
    return `${IMAGE_URL}/${i}`;
  };

  const toThumbnail = checksum => {
    return `${IMAGE_URL}/_cache/${checksum}.thumb.jpg`;
  };

  const updateCollection = (ev, c, i) => {
    if (ev.target.checked) {
      newTag = `Collection ${c}`
      addTag()
    } else {
      let tag = `Collection ${c}`
      deleteTag(tag) 
    }
  }

  const deleteTag = tag => {
    if (confirm(`Do you want to remove tag: "${tag}" ?`)) {
      console.log("remove tag", tag);

      addingTag = true;

      let res = removeImageTag(email, password, checksum, tag)
        .then(res => {
          console.log(res);
          image = res.removeImageTag;
          checksum = image.checksum;
          console.log("new checksum", checksum);
          addingTag = false;
          history.replaceState(
            { checksum },
            `Editing Image: ${checksum}`,
            `${location.pathname}?checksum=${checksum}&view=ImageEditor`
          );
        })
        .catch(n => {
          console.error(n);
          error = n.map(e => e.message).join(`. `);
          addingTag = false;
        });
    }
  };

  const addTag = () => {
    if (newTag.length <= 2) {
      alert("Can't add tags that short.");
      return false;
    }

    addingTag = true;

    let res = addImageTag(email, password, checksum, newTag)
      .then(res => {
        console.log(res);
        image = res.addImageTag;
        checksum = image.checksum;
        console.log("new checksum", checksum);
        addingTag = false;

        if (newTag.indexOf("Collection") !== -1) {
          addingTag = true
           getSelectors().then(selectors => {
              tags = selectors.keywords
              collections = selectors.collections
              refreshImage({checksum})
              addingTag = false;
            });
        }

        newTag = "";
        history.replaceState(
          { checksum },
          `Editing Image: ${checksum}`,
          `${location.pathname}?checksum=${checksum}&view=ImageEditor`
        );
        
      })
      .catch(n => {
        console.error(n);
        error = n.map(e => e.message).join(`. `);
        addingTag = false;
      });
  };

  let description = "";
  let caption = "";
  const updateCaptionAndDescription = () => {

    if (image.metadata.description !== description) {
      updatingText = true;
      setImageDescription(email, password, checksum, description)
        .then(res => {
          console.log(res);
          image = res.setImageDescription;
          checksum = image.checksum;
          console.log("new checksum", checksum);
          updatingText = false;
          history.replaceState(
            { checksum },
            `Editing Image: ${checksum}`,
            `${location.pathname}?checksum=${checksum}&view=ImageEditor`
          );
        })
        .catch(n => {
          console.error(n);
          error = n.map(e => e.message).join(`. `);
          updatingText = false;
        });
    }
    if (image.metadata.caption !== caption) {
      updatingText = true;
      setImageCaption(email, password, checksum, caption)
        .then(res => {
          console.log(res);
          image = res.setImageCaption;
          checksum = image.checksum;
          console.log("new checksum", checksum);
          updatingText = false;
          history.replaceState(
            { checksum },
            `Editing Image: ${checksum}`,
            `${location.pathname}?checksum=${checksum}&view=ImageEditor`
          );
        })
        .catch(n => {
          console.error(n);
          error = n.map(e => e.message).join(`. `);
          updatingText = false;
        });
    }

  }

  loggedIn = savedCredentials();
  let collections;
  let activeCollections;
  let tags;

  const unsub = currentView.subscribe(i => {
    console.dir("view changed", i);
    if (i.view == "ImageEditor") {
      getSelectors().then(selectors => {
        tags = selectors.keywords.sort()
        collections = selectors.collections
        refreshImage(i.data);
      });
    }
  });

  onDestroy(() => unsub());
</script>

<style>
  .image-view-container {
    margin: auto;
    width: 100%;
  }

  .single-image-wrapper {
    padding: 15px;
  }

  .single-image-link {
    border-bottom: solid 1px #b7872b;
    text-decoration: none;
    color: #fff;
    background-color: #649800;
    border-radius: 8px;
    margin-left: 3px;
    margin-right: 3px;
    padding: 5px;
    font-size: 12px;
  }

  .description, .caption {
    font-family: sans-serif;
    font-size: 20px;
    color: #333333;
    display: block;
    width: 100%
  }

  .tag {
    cursor: pointer;
    background-color: #f1f6fffc;
    border-radius: 8px;
    border: 1px solid #9a9a9a;
    margin: 3px;
    padding: 5px;
    display: inline-block;
    color: #444;
    font-size: 12px;
  }

  .more-images {
    cursor: pointer;
  }

  .author {
    cursor: pointer;
  }

  p.error {
    color: red;
  }

  .collection-label {
    display: inline-block;
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
</style>

<div class="collection-header">
  <h3 class="collection-title">Image Editor</h3>
</div>
{#if error}
  <p class="error">{error}</p>
{/if}
{#if !loggedIn}
  <p>Please log in.</p>
  <form on:submit|preventDefault={testAndSaveLogin}>
    <label for="email">Email:</label>
    <input type="text" id="email" bind:value={email} />
    <label for="password">Password:</label>
    <input type="password" id="password" bind:value={password} />
    <br />
    <input type="submit" value="log in" />
  </form>
{:else if loading}
  <div class="loading-wrapper">
    <i class="fa fa-spinner fa-spin fa-3x" />
  </div>
{:else}
  <div class="image-view-container">
    <div class="single-image-wrapper">
      <div class="single-image">
        <img src={toImageURL(image.medpath)} alt={image.metadata.description} />
        {#if !updatingText}
        <form on:submit|preventDefault={updateCaptionAndDescription}>
          <label for="caption">Caption <i>(IPTC:Caption-Abstract)</i></label>
          <textarea name="caption" class="caption" bind:value={caption}></textarea>
          <label for="description">Description <i>(EXIF:ImageDescription and XMP:Description)</i></label>
          <textarea rows="10" name="description" class="description" bind:value={description}></textarea>
          <input type="submit" value="Save Caption &amp; Description" />
          <p>
          Be aware that HAMSA uses only description, it doesn't expose caption to the readers. Caption is editable so that other applications can query for it in the future.
          </p>
          <p>
          The plan is that <i>caption</i> is a short description and <i>description</i> is a longer description.
          </p>
        </form>
        {:else}
        <div class="loading-wrapper">
          <i class="fa fa-spinner fa-spin fa-3x" />
        </div>
        {/if}
      </div>
      <div class="metadata">
        <div
          class="author"
          on:click={() => go('Collection', { artist: image.metadata.artist })}>
          <i class="far fa-user fa-lg" />
          <h2>{image.metadata.artist}</h2>
        </div>
        <div class="dotted" />
        <div class="tags">
          <h2>Tags</h2>
          {#each image.metadata.keywords as tag}
            <span
              tooltip="click to delete"
              class="tag"
              on:click={() => deleteTag(tag)}>
              {tag} | x
            </span>
          {/each}
          <br />
          <br />
          {#if addingTag}
            <div>
              <i class="fa fa-spinner fa-spin" />
            </div>
          {:else}
            <form on:submit|preventDefault={addTag}>
              <label for="newtag">Add Tag:</label>
              <select bind:value={newTag}>
              {#each tags as tag}
              <option value="{tag}">{tag}</option>
              {/each}
              </select>
              <input type="submit" value="Assign tag" />
              <h2>Collections</h2>
              {#each collections as collection, i}
              <div>
              <input 
              type="checkbox" 
              bind:checked={activeCollections[i]}
              on:change={(ev) => updateCollection(ev, collection, i)}
              name="collection-{i}">
              <label class="collection-label" for="collection-{i}">{collection}</label>
              </div>
              {/each}
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
