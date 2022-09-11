function parseData(callback) {
	const url = "https://docs.google.com/spreadsheets/d/1uk0OnioNZgLly_Y9pZ1o0p3qYS9-mpknkv3DlkXAxGA/export?format=csv&gid=1886110215";
	Papa.parse(url, {
		download: true,
		complete: function (result) {
			console.log(result);
			result = result.data;
			let ret = {}
			ret.lastUpdate = result[3][2];
			ret.killers = [];
			for (let i = 10; i < result.length; i += 13) {
				ret.killers.push(parseKiller(result, i, 1));
			}
			callback(ret);
		}
	});
}

function parseKiller(data, row, col) {
	let killer = {};
	killer.name = data[row][col];
	killer.builds = [];
	for (let i = 1; i < 8; i += 2) {
		let build = {};
		build.name = data[row + 2][col + i];
		build.perks = [];
		for (let j = 4; j < 8; j++) {
			build.perks.push(data[row + j][col + i])
		}
		killer.builds.push(build);
	}
	return killer;
}