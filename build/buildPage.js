const url = "https://docs.google.com/spreadsheets/d/1uk0OnioNZgLly_Y9pZ1o0p3qYS9-mpknkv3DlkXAxGA/export?format=csv&gid=1886110215";

const axios = require("axios").default;
const fs = require("fs");
const hbs = require("handlebars");
const template = hbs.compile(fs.readFileSync("pageTemplate.hbs", { encoding: 'utf8', flag: 'r' }));
const Papa = require("papaparse");
const Fuse = require('fuse.js');

const perks = JSON.parse(fs.readFileSync("../perks.json"));
for (let i = 0; i < perks.killer.length; i++) perks.killer[i].id = i;
for (let i = 0; i < perks.survivor.length; i++) perks.survivor[i].id = i;

const FuseOptions = { threshold: 0.85, keys: ["perkName"] };
const FuseKiller = new Fuse(perks["killer"], FuseOptions);
const FuseSurvivor = new Fuse(perks["survivor"], FuseOptions);

// I'm not the biggest fan of the hardcoded things here
// But I think its worth since it allows auto grabbing images
let killerImages = new Set(perks.killer.map((x) => x?.characterImage));
killerImages.delete(undefined);
killerImages = [...killerImages];
// Since demogorgon's teachables became common perks, his image won't be on the list
// So sadly, this is hardcoded
killerImages.push("https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/6/6d/K17_charSelect_portrait.png");
killerImages.sort(function (a, b) { return a.split("/").pop().localeCompare(b.split("/").pop(), 'en', { numeric: true }); });
// Hardcode order so huntress comes before the other paid killers
// This is done to reflect the spreadsheet order
const huntress = killerImages.splice(7, 1);
killerImages.splice(4, 0, huntress);

let survivorImages = ["img/OtzZarina.png", "img/OtzSWF.png", "img/SurvivorBuildsOthers.png"];

function parseData(callback) {
	// Fetch builds spreadsheet
	axios.get(url)
		.then(data => {
			// Parse csv file
			Papa.parse(data.data, {
				complete: function (result) {
					// console.log(result);
					result = result.data;
					let ret = {}
					// Grab change date
					ret.changeDate = result[3][2];
					ret.killers = [];
					ret.survivors = [];
					ret.v = Date.now();
					// Parse all killers
					for (let i = 10; i < result.length; i += 13) {
						ret.killers.push(parseCharacter("killer", result, i, 1));
					}
					// Parse all survivors
					for (let i = 10; result[i][10]; i += 13) {
						ret.survivors.push(parseCharacter("survivor", result, i, 10));
					}
					callback(ret);
				}
			});
		});

}

// Function that parses each individual killer
// Role: "survivor" or "killer"
// Data: parsed csv file as 2D array
// Row, col: indexes of killer's name
// All other values are retrieved based on offsets from the name
function parseCharacter(role, data, row, col) {
	let character = {};
	character.name = data[row][col];
	character.builds = [];
	if (role === "killer") {
		character.img = killerImages.splice(0, 1);
	} else {
		character.img = survivorImages.splice(0, 1);
	}
	// Loop over columns (builds)
	for (let i = 1; i < 8; i += 2) {
		let build = {};
		build.name = data[row + 2][col + i];
		build.perks = [];
		// Loop over rows (perks)
		for (let j = 4; j < 8; j++) {
			// Allow multiple entries per perk (alternatives)
			let buildPerk = data[row + j][col + i].split("/");
			let perkObject = {};

			// Each perk of the build can have multiple entries, first valid one is taken as the 'main', others are 'alternatives'
			for (perkStr of buildPerk) {
				let perk = findPerk(role, perkStr);
				if (perk) {
					// First perk assigned
					if (!perkObject.perk) {
						perkObject.perk = perk;
					} else { // Any alternative perks
						if (!perkObject.alternatives) {
							perkObject.alternatives = [];
							perkObject.alternativesImg = perk.perkImage;
						}
						perkObject.alternatives.push(perk.id);
					}
				} else {
					console.log(`::warning title=${character.name} [ ${build.name} ]::Couldn't match perk '${perkStr}'`);
				}
			}
			// Stringify alternative perk array
			if (perkObject.alternatives) perkObject.alternatives = perkObject.alternatives.toString();
			// If perk was successfully found
			if (perkObject.perk) build.perks.push(perkObject);
		}
		character.builds.push(build);
	}
	return character;
}

// Role: "survivor" or "killer"
function findPerk(role, perkName) {
	if (role == "killer") {
		return FuseKiller.search(perkName)[0]?.item;
	} else {
		return FuseSurvivor.search(perkName)[0]?.item;
	}
}

parseData(data => fs.writeFileSync("../index.html", template(data)));