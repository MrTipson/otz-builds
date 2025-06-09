const fs = require('fs');
const { JSDOM } = require('jsdom');
const axios = require("axios").default;

// Parse perks from the wikipedia perk tables
async function parsePerks(url) {
	const stuff = await axios.get(url);
	const dom = new JSDOM(stuff.data);
	const { document } = dom.window;
	// Grab all rows in table
	perks = [...document.querySelector("tbody").children]
		.map((x) => {
			// Remove mini icons next to links
			x.children[2].querySelectorAll(".iconLink").forEach((y) => y.remove());
			const imageElement = x.children[0].querySelector("img");
			const imageUrl = imageElement?.src.substring(0, imageElement.src.lastIndexOf("/")).replace("/thumb", "");
			// Remap each row into object
			return {
				perkImage: "https://deadbydaylight.wiki.gg" + imageUrl,
				perkName: imageElement?.alt,
				// Description is URI encoded for simplicity
				description: encodeURI(x.children[2].innerHTML.replaceAll("/wiki/", "https://deadbydaylight.wiki.gg/wiki/")),
				character: x.children[3].querySelector("a")?.title,
				characterImage: x.children[3].querySelector("img")?.src
			}
		});
	// Sort so binary search can be used
	perks.sort(function (a, b) { return a.perkName.localeCompare(b.perkName, 'en') });
	return perks;
}

(async function () {
	// Grab webpage
	let perks = {
		killer: await parsePerks("https://deadbydaylight.wiki.gg/wiki/Killer_Perks"),
		survivor: await parsePerks("https://deadbydaylight.wiki.gg/wiki/Survivor_Perks")
	}
	// Write back into file
	fs.writeFileSync("../perks.json", JSON.stringify(perks, null, '\t'));
}());
