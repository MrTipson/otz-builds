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

// Count of currently open modals
let modalDepth = 0;
function showPerkDetails(role, perkid, alternatives) {
	const modalTemplate = document.getElementById("modalTemplate").content.cloneNode(true);
	const modal = modalTemplate.querySelector(".modalbg");
	if (alternatives) {
		let altIds = alternatives.split(",");
		// modal.querySelector(".alternatives").textContent = altIds.map(x => perks[role][x].perkName);
		for (altid of altIds) {
			let img = document.createElement("img");
			img.title = perks[role][altid].perkName;
			img.alt = perks[role][altid].perkName;
			img.src = perks[role][altid].perkImage;
			img.classList.add("perk");
			img.dataset.role = role;
			img.dataset.id = altid;
			modal.querySelector(".alternativePerks").appendChild(img)
		}
	} else {
		modal.querySelector(".alternatives").remove();
	}
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
			modal.remove();
			// Only remove blur on body if no modals left
			if (--modalDepth == 0) {
				document.body.classList.remove("blur");
			}
		}
	});
	modalDepth++;
	document.body.appendChild(modal);
	document.body.classList.add("blur");
}

document.addEventListener("click", function (event) {
	if (event.target.classList.contains("perk")) {
		showPerkDetails(event.target.dataset.role, event.target.dataset.id, event.target.dataset.altperks);
	} else if (event.target.classList.contains("sidebarTab")) {
		document.querySelector("nav").classList.toggle("open");
	}
});

document.getElementById('togglePerkNames').addEventListener('click', function() {
	var perkNames = document.querySelectorAll('.perkName');
	for (var i = 0; i < perkNames.length; i++) {
	  if (perkNames[i].style.display === "none") {
		perkNames[i].style.display = "block";
	  } else {
		perkNames[i].style.display = "none";
	  }
	}
  });
  