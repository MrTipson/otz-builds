const fs = require('fs');
const { JSDOM } = require('jsdom');

// Parse perks from the wikipedia perk tables
async function parsePerks(url) {
	const dom = await JSDOM.fromURL(url);
	const { document } = dom.window;
	// First element is apparently thead (jsdom is wack)
	// Grab all rows in table
	perks = [...document.querySelector("tbody").children].slice(1)
		.map((x) => {
			// Remove mini icons next to links
			x.children[2].querySelectorAll("span[style*=padding]")
				.forEach((y) => y.remove());
			// Remap each row into object
			return {
				perkImage: x.querySelectorAll("a")[0].href.replace(/\/revision\/latest.+/, ""),
				perkName: x.querySelectorAll("a")[1].title,
				// Description is URI encoded for simplicity
				description: encodeURI(x.children[2].innerHTML.replaceAll("/wiki/", "https://deadbydaylight.fandom.com/wiki/")),
				character: x.children[3].querySelectorAll("a")[0]?.title,
				characterImage: x.children[3].querySelector("img")?.dataset.src.replace(/\/revision\/latest.+/, "")
			}
		});
	// Sort so binary search can be used
	perks.sort(function (a, b) { return a.perkName.localeCompare(b.perkName, 'en') });
	return perks;
}

(async function () {
	// Grab webpage
	let perks = {
		killer: await parsePerks("https://deadbydaylight.fandom.com/wiki/Killer_Perks"),
		survivor: await parsePerks("https://deadbydaylight.fandom.com/wiki/Survivor_Perks")
	}
	// Write back into file
	fs.writeFileSync("../perks.json", JSON.stringify(perks, null, '\t'));
}());
