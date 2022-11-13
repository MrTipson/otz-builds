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

function showPerkDetails(role, perkid) {
	const modalTemplate = document.getElementById("modalTemplate").content.cloneNode(true);
	const modal = modalTemplate.querySelector(".modalbg");
	if (perks[role][perkid].character) {
		modal.querySelector(".perkCharacter").textContent = `Teachable perk from ${role == "killer" ? "the " : ""}${perks[role][perkid].character}`;
	} else {
		modal.querySelector(".perkCharacter").textContent = `Common perk`;
	}
	modal.querySelector(".perkName").textContent = perks[role][perkid].perkName;
	modal.querySelector(".perkDescription").innerHTML = decodeURI(perks[role][perkid].description);
	const img = document.createElement("img");
	img.classList.add("perkImage");
	img.src = perks[role][perkid].perkImage;
	img.alt = perks[role][perkid].perkName;
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
		showPerkDetails(event.target.dataset.role, event.target.dataset.id);
	} else if (event.target.classList.contains("sidebarTab")) {
		document.querySelector("nav").classList.toggle("open");
	}
});
