<script>
  import { go } from "./navigation.js";

  let query;

  function search(event) {
    if (event.key === "Enter") {
      console.log("search", query);
      go("Collection", { query });
    }
  }
</script>

<style>
  .round-wrapper {
    border-radius: 30px;
    border: 1px solid;
    display: inline-block;
    padding: 10px;
    width: 240px;
    background-color: #d8b36c;
    color: #783441;
    font-weight: 600;
    cursor: pointer;
  }

  .round-wrapper input.search {
    border: none;
    padding-left: 8px;
    font-family: sans-serif;
    background: none;
    font-weight: 600;
    color: #783441;
    padding: 0;
    margin: 0;
  }

  input.search::placeholder {
    font-size: 1.1em;
    padding-left: 8px;
    font-family: sans-serif;
    color: #783441;
  }
</style>

<div class="round-wrapper is-search-box">
  <input
    class="search"
    placeholder="Search"
    bind:value={query}
    on:keydown={search} />
  <i class="fa fa-search" />
</div>
