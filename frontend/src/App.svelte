<script>
	import Header from "./Header.svelte";
	import Hero from "./Hero.svelte";
	import SelectorControls from "./SelectorControls.svelte";
	import InfoPage from "./InfoPage.svelte";
	import Collection from "./Collection.svelte";

	const views = {
		"InfoPage": InfoPage,
		"Collection": Collection
	}

	let currentView = "Collection"
</script>

<div>
	<Header />
	<Hero />
	<SelectorControls />
	<svelte:component this={views[currentView]} />
</div>
