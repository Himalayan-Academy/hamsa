<script>
  import { getImage, login, addImageTag, removeImageTag } from "./api.js";
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

  loggedIn = savedCredentials();

  const unsub = currentView.subscribe(i => {
    console.dir("view changed", i);
    if (i.view == "ImageEditor") {
      refreshImage(i.data);
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

  .description {
    font-family: sans-serif;
    font-size: 20px;
    color: #333333;
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
</style>

<h1>Image Editor</h1>
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
        <a
          href={toImageURL(image.path)}
          target="_blank"
          download={toFilename(image.path)}
          class="single-image-link">
          Download this image
        </a>
        <p class="description">{image.metadata.description}</p>
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
              <label for="newtag">New Tag:</label>
              <input type="text" id="newtag" bind:value={newTag} />
              <input type="submit" value="Add tag" />
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
