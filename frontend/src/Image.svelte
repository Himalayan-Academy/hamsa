<script>
  import { getImage } from "./api.js";
  import { currentView, go } from "./navigation.js";
  import { onDestroy } from "svelte";

  export let checksum;

  let image = {};
  let loading = true;
  let IMAGE_URL = "//dev.himalayanacademy.com/hamsa-images";

  const refreshImage = data => {
    let checksum = data.checksum;
    loading = true;
    getImage({ checksum }).then(res => {
      image = res.image;
      loading = false;
    });
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

  const unsub = currentView.subscribe(i => {
    console.dir("view changed", i);
    if (i.view == "Image") {
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

  .aum-glyph {
    display: block;
    float: right;
    color: black;
  }

  .aum-glyph:hover {
    cursor: pointer;
  }
</style>

{#if loading}
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
              class="tag"
              on:click={() => go('Collection', { keyword: tag })}>
              {tag}
            </span>
          {/each}
        </div>
        <div class="dotted" />
        <h3>More by the same artist</h3>
        {#each image.metadata.more as more}
          <img
            src={toThumbnail(more)}
            on:click={() => go('Image', { checksum: more })}
            alt="more"
            class="more-images" />
        {/each}
      </div>
    </div>
  </div>
  <div on:click={() => {
    console.log("checksum", image.checksum)
    go('ImageEditor', {checksum: image.checksum})
    }
   } class="aum-glyph">
    <span>ॐ</span>
  </div>
{/if}
