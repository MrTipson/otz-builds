const fs = require('fs');
const { JSDOM } = require('jsdom');

(async function () {
	// Grab webpage
	const dom = await JSDOM.fromURL("https://deadbydaylight.fandom.com/wiki/Killer_Perks");
	const { document } = dom.window;
	// Remove mini icons next to links
	document.querySelectorAll(".formattedPerkDesc")
		.forEach((x) => x.querySelectorAll("span[style*=padding]")
			.forEach((y) => y.remove()));
	// First element is apparently thead (jsdom is wack)
	// Grab all rows in table
	perks = [...document.querySelector("tbody").children].slice(1)
		.map((x) => {
			// Remap each row into object
			return {
				filename: x.querySelectorAll("a")[0].href.replace(/\/revision\/latest.+/, ""),
				name: x.querySelectorAll("a")[1].title,
				// Description is URI encoded for simplicity
				desc: encodeURI(x.querySelector(".formattedPerkDesc").innerHTML.replaceAll("/wiki/", "https://deadbydaylight.fandom.com/wiki/")),
				killer: x.children[3].querySelectorAll("a")[0]?.textContent,
				killerimg: x.children[3].querySelectorAll("a")[1]?.href.replace(/\/revision\/latest.+/, "")
			}
		});
	// Sort so binary search can be used
	perks.sort(function (a, b) { return a.name.localeCompare(b.name, 'en') });
	// Write back into file
	fs.writeFileSync("../perks.json", JSON.stringify(perks, null, '\t'));
}());
