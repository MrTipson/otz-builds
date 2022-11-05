const url = "https://docs.google.com/spreadsheets/d/1uk0OnioNZgLly_Y9pZ1o0p3qYS9-mpknkv3DlkXAxGA/export?format=csv&gid=1886110215";

const axios = require("axios").default;
const fs = require("fs");
const hbs = require("handlebars");
const template = hbs.compile(fs.readFileSync("pageTemplate.hbs", { encoding: 'utf8', flag: 'r' }));
const Papa = require("papaparse");
const stringSimilarity = require("string-similarity");

const perks = JSON.parse(fs.readFileSync("../perks.json"));
for (let i = 0; i < perks.length; i++) perks[i].id = i;
// I'm not the biggest fan of the hardcoded things here
// But I think its worth since it allows auto grabbing images
let killerImages = new Set(perks.map((x) => x?.killerimg));
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
					ret.lastUpdate = result[3][2];
					ret.killers = [];
					// Parse all killers
					for (let i = 10; i < result.length; i += 13) {
						ret.killers.push(parseKiller(result, i, 1));
					}
					callback(ret);
				}
			});
		});

}

// Function that parses each individual killer
// Data: parsed csv file as 2D array
// Row, col: indexes of killer's name
// All other values are retrieved based on offsets from the name
function parseKiller(data, row, col) {
	let killer = {};
	killer.name = data[row][col];
	killer.builds = [];
	killer.img = killerImages.splice(0, 1);
	// Loop over columns (builds)
	for (let i = 1; i < 8; i += 2) {
		let build = {};
		build.name = data[row + 2][col + i];
		build.perks = [];
		// Loop over rows (perks)
		for (let j = 4; j < 8; j++) {
			let perkid = findPerk(data[row + j][col + i]);
			if (perkid !== -1) {
				build.perks.push(perks[perkid]);
			} else {
				console.log(`::warning title=${killer.name} [ ${build.name} ]::Couldn't match perk '${data[row + j][col + i]}'`);
			}
		}
		killer.builds.push(build);
	}
	return killer;
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

parseData(data => fs.writeFileSync("../index.html", template({ killers: data.killers, changeDate: data.lastUpdate })));