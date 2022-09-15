// Perks list is used to diplay perk descriptions when clicked
let perks;
async function getperks() {
	perks = await fetch("perks.json");
	perks = await perks.text();
	perks = JSON.parse(perks);
}
getperks();

// If link in sidebar is clicked, close sidebar automatically
const sidebar = document.getElementById("sidebar");
sidebar.addEventListener("click", function (event) {
	if (event.target.tagName === "A") {
		sidebar.classList.remove("open");
	}
});

function showPerkDetails(perkid) {
	const modalTemplate = document.getElementById("modalTemplate").content.cloneNode(true);
	const modal = modalTemplate.querySelector(".modalbg");
	modal.querySelector(".perkName").textContent = perks[perkid].name;
	modal.querySelector(".perkDescription").innerHTML = decodeURI(perks[perkid].desc);
	const img = document.createElement("img");
	img.classList.add("perkImage");
	img.src = perks[perkid].filename;
	img.alt = perks[perkid].name;
	modal.querySelector(".perkDescription").prepend(img);
	modal.addEventListener("click", (event) => {
		if (event.target == modal) {
			modal.remove(); document.body.classList.remove("blur");
		}
	});
	document.body.appendChild(modal);
	document.body.classList.add("blur");
}

document.addEventListener("click", function (event) {
	if (event.target.classList.contains("perk")) {
		showPerkDetails(event.target.dataset.id);
	} else if (event.target.classList.contains("sidebarTab")) {
		document.querySelector("nav").classList.toggle("open");
	}
});