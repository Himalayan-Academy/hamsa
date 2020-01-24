<script>
    import SelectorButton from "./SelectorButton.svelte";
    import SearchField from "./SearchField.svelte";
    import {getSelectors} from "./api.js";
    import {onMount} from "svelte";
    import {go} from "./navigation.js";

    let artistsList = [];
    let collectionList = [];
    let keywordList = [];

    onMount(async () => {
        let selectors = await getSelectors();
        artistsList = selectors.artists.sort();
        collectionList  = selectors.collections.sort();
        keywordList = selectors.keywords.sort();

        console.log("selectors data", selectors)


    })

    const goInfo = () => {
        go("InfoPage");
    }
</script>
<style>
    .selector-controls {
        display: flex;
        padding: 12px;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;
        position: relative;
        background-color: #783441;
    }

    .bolotinha {
        border-radius: 50%;
        background-color: #D8B36C;
        color: #783441;
        padding: 10px;
        font-size: 1.3em;
        font-weight: 600;
        display: flex;
        font-family: sans-serif;
        width: 40px;
        height: 40px;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
</style>

<div class="selector-controls">
    <div class="bolotinha" on:click={goInfo}><span>i</span></div>
    <SelectorButton title="Tags" key="keyword" items={keywordList} />
    <SelectorButton title="Artists" key="artist" items={artistsList} />
    <SelectorButton title="Collections" key="collection" items={collectionList} />
    <SearchField />
</div>