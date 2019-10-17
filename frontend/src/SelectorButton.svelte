<script>
    export let title="untitled";
    export let items=[];

    let open = false;

    const onClick = (item) => {
        console.log("clicked", item)
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

    .selector-text {
        color: rgba(0, 0, 0, 0.54);
    }

    .selector-content {
        display: none;
        position: absolute;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
        padding: 4px 8px;
        margin: 0;
        width: 200px;
        background-color: #FFFF;
        font-family: sans-serif;
        font-weight: 300;
    }

    .open {
        display: block;
        max-height: 400px;
        overflow-y: scroll;
        z-index: 9999;
    }

    .list-item {
        display: block;
        padding: 8px;
        cursor: pointer;
    }
</style>

<div class="round-wrapper is-selector-categories" on:click={() => open = !open}>
    <div class="selector-text">
        <span class="title">{title}</span>
        <i class="fa fa-caret-down"></i>
    </div>
    <ul class="selector-content" class:open>
    {#each items as item}
        <li class="list-item" on:click={() => {onClick(item)}}>{item}</li>
    {/each}
    </ul>
</div>