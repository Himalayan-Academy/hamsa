<script>
import LoginDialog from "./LoginDialog.svelte";
import {  loggedIn } from "./api.js";

let dialogOpen = false;
let email = false;

</script>

<style>
  .logo {
    display: flex;
    justify-content: center;
    align-items: center;
    vertical-align: middle;
    color: rgb(255, 255, 255);
    text-decoration: none;
    z-index: 999;
  }

  .monastery-logo {
    margin-right: 120px;
    z-index: 9999;
    height: 100px;
  }

  .monastery-logo img {
    max-width: 100%;
  }

  .aum-glyph {
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #f4f3f1;
    font-size: 0.9rem;
    height: 100%;
    flex: 1 1 auto;
  }

  .aum-glyph span {
    padding: 5px;
  }
</style>

<div>
  <header>
    <a href="/hamsa" class="logo">
      <img
        src="images/hamsa-logo-opt.jpg"
        alt="HAMSA logo"
        class="hamsa-logo" />
    </a>
    <div class="monastery-header-text">
      <h1 class="title">Himalayan Academy</h1>
      <h2 class="subtitle">Museum of Spiritual Art</h2>
      <div style="flex: auto" />
    </div>
    <a href="/" class="monastery-logo">
      <img
        class="monastery-logo"
        src="images/monastery-logo.png"
        alt="Monastery Logo" />
    </a>
    <div
      on:click={() => {
        dialogOpen = !dialogOpen;
      }}
      class="aum-glyph">
      {#if !$loggedIn}
      <span>ॐ</span>
      {:else}
      <span>{sessionStorage.getItem("email")}</span>
      {/if}
      {#if dialogOpen}
      <LoginDialog 
      on:loggedIn={(ev) => {
          console.log("received logged in event")
          dialogOpen = false;
          email = ev.detail;
      }}
      on:loggedOut={(ev) => {
          console.log("received log out event")
          dialogOpen = false;
          email = false;
      }}></LoginDialog>
      {/if}
    </div>
  </header>
</div>
