function buildPage(content) {
	console.log(content);
	document.getElementById("changeDate").textContent = content.lastUpdate;
	// Prepare templates for the killers and builds
	const killerTemplate = document.getElementById("killerTemplate").content;
	const buildTemplate = document.getElementById("buildTemplate").content;
	const killersNode = document.getElementById("killers");
	// Loop through all the killers
	for (let killer of content.killers) {
		let killerNode = killerTemplate.cloneNode(true);
		// Set killer name and image
		killerNode.querySelector(".killer").id = killer.name;
		killerNode.querySelector(".killerName").textContent = killer.name;
		killerNode.querySelector(".image").alt = killer.name;
		killerNode.querySelector(".image").src = `img/killers/${killer.name}.png`;
		let builds = killerNode.querySelector(".builds");
		// Loop through all the builds
		for (let build of killer.builds) {
			let buildNode = buildTemplate.cloneNode(true);
			buildNode.querySelector(".buildName").textContent = build.name;
			let bperks = buildNode.querySelector(".perks");
			// Loop through all the perks
			for (let perk of build.perks) {
				let perkNode = document.createElement("img");
				perkNode.classList.add("perk");
				let id = findPerk(perk);
				if (id >= 0) {
					perkNode.alt = perks[id].name;
					perkNode.src = `${perks[id].filename}`;
					perkNode.dataset.id = id;
				} else {
					console.error("Couldnt find " + perk);
					perkNode.alt = "Error";
				}
				bperks.appendChild(perkNode);
			}
			builds.appendChild(buildNode);
		}
		killersNode.appendChild(killerNode);
	}
}

function showPerkDetails(perkid) {
	const modalTemplate = document.getElementById("modalTemplate").content.cloneNode(true);
	const modal = modalTemplate.querySelector(".modal");
	modal.querySelector(".perkName").textContent = perks[perkid].name;
	console.log(perks[perkid].desc);
	modal.querySelector(".perkDescription").textContent = perks[perkid].desc.replaceAll("\\n", "\n");
	const img = document.createElement("img");
	img.classList.add("perkImage");
	img.src = perks[perkid].filename;
	img.alt = perks[perkid].name;
	modal.querySelector(".perkDescription").prepend(img);
	modal.querySelector(".closeModal").addEventListener("click", () => {
		modal.remove(); document.querySelector(".body").classList.remove("blur");
	});
	document.body.appendChild(modal);
	document.querySelector(".body").classList.add("blur");
}

// Binary search
function findPerk(perkName) {
	let lower = 0;
	let upper = perks.length - 1;
	while (lower <= upper) {
		let mid = Math.floor((lower + upper) / 2);
		if (stringSimilarity.compareTwoStrings(perkName, perks[mid].name) > 0.85) {
			return mid;
		} else if (perks[mid].name > perkName) {
			upper = mid - 1;
		} else {
			lower = mid + 1;
		}
	}
	return -1;
}
// Optionally, remove all quotes
// [...document.querySelectorAll("span[class~=clr9]")].forEach((x)=>x.remove())
// Oneliner to grab all perk names, descriptions and filenames
// perks = [...document.querySelector("tbody").children].map((x)=>{return {filename: x.querySelectorAll("a")[0].href.replace(/\/revision\/latest.+/,""), name: x.querySelectorAll("a")[1].title, desc: x.querySelector(".formattedPerkDesc").innerText}})
// Make sure they are sorted, so we can search with binary search
// perks.sort(function(a, b){return a.name.localeCompare(b.name, 'en')});
// And then JSON.stringify(perks)
let perks;
async function getperks() {
	perks = await fetch("json/perks.json");
	perks = await perks.text();
	perks = JSON.parse(perks);
}
getperks();
// Call data adapter and pass build function as callback
parseData(buildPage);

document.addEventListener("click", function (event) {
	if (event.target.classList.contains("perk")) {
		showPerkDetails(event.target.dataset.id);
	}
});