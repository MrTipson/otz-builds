const url = "https://docs.google.com/spreadsheets/d/1uk0OnioNZgLly_Y9pZ1o0p3qYS9-mpknkv3DlkXAxGA/export?format=csv&gid=1886110215";

const axios = require("axios").default;
const fs = require("fs");
const hbs = require("handlebars");
const template = hbs.compile(fs.readFileSync("pageTemplate.hbs", { encoding: 'utf8', flag: 'r' }));
const Papa = require("papaparse");
const stringSimilarity = require("string-similarity");

const perks = JSON.parse(fs.readFileSync("../perks.json"));
for (let i = 0; i < perks.length; i++) perks[i].id = i;

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
	// Loop over columns (builds)
	for (let i = 1; i < 8; i += 2) {
		let build = {};
		build.name = data[row + 2][col + i];
		build.perks = [];
		// Loop over rows (perks)
		for (let j = 4; j < 8; j++) {
			let perkid = findPerk(data[row + j][col + i]);
			build.perks.push(perks[perkid]);
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