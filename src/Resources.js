const global = {};

global.initLoaded = false;
global.resourceTypes = {
	JSON: [".json"],
	TEXT: [".txt"],
	IMAGE: [".png", ".jpg"],
	VIDEO: [".mp4"],
	SHADER: [".shader", ".fs", ".vs"],
	GEOMETRY: [".obj"],
};

global.queue = new Set();
global.map = new Map();

/*
	Resource.add({ name, path }: arr, startLoading: bool): startLoading ? Promise : null
		# add resource to queue

	Resource.load(): Promise
		# initiate loading of queue

	Resource.map(void)
		# return resource map

	Resource.get(name: str)
		# return resource data by name

	Resource.finished: bool
		# returns if queue is finished
*/

export class Resources {

	static get Types() {
		return global.resourceTypes;
	}

	static get finished() {
		return global.queue.size === 0;
	}

	static add(obj, startLoad) {
		for(let key in obj) {
			global.queue.add({ name: key, path: obj[key] });
		}
		if(startLoad === true) {
			return Resources.load();
		}
	}

	static map() {
		return global.map;
	}

	static get(name) {
		return global.map.get(name);
	}

	static load() {
		let loads = [];

		for(let res of global.queue) {
			const loading = Resources._fetch(res.path).then(dataObj => {
				const resource = res;
				global.map.set(resource.name, dataObj);
			});
			loads.push(loading);
		}

		return Promise.all(loads).then(() => {
			global.queue.clear();

			if(!global.initLoaded && Resources.finished) {
				global.initLoaded = true;
			}
		})
	}

	static _fetch(path) {
		let type = null;

		for(let t in Resources.Types) {
			for(let ending of Resources.Types[t]) {
				if(path.match(ending)) {
					type = Resources.Types[t];
				}
			}
		}

		switch(type) {

			case Resources.Types.JSON:
				return fetch(path).then(res => res.json().catch(err => {
					console.error("File failed parsing:", path);
				}));

			case Resources.Types.IMAGE:
				return new Promise((resolve, reject) => {
					const img = new Image();
					img.onload = () => {
						resolve(img);
					}
					img.src = path;
				});

			case Resources.Types.VIDEO:
				return new Promise((resolve, reject) => {
					const vid = document.createElement('video');
					vid.oncanplay = () => {
						vid.width = 1024;
						vid.height = 1024;
						vid.loop = true;
						vid.play();
						resolve(vid);
					}
					vid.src = path;
				});

			case Resources.Types.GEOMETRY:
				return fetch(path).then(res => res.text().then(strData => {
					return Resources.parseOBJFile(strData);
				}));
				
			case Resources.Types.TEXT:
				return fetch(path).then(res => res.text());
				
			case Resources.Types.SHADER:
				return fetch(path).then(res => res.text());

			default:
				throw `Err: not a valid resource type: "${path}"`;
		}
	}

	static parseOBJFile(str) {
		const lines = str.split(/\n/g);

		const objData = {
			vertecies: [],
			uvs: [],
			indecies: [],
		}

		for(let line of lines) {
			const data = line.split(" ");
			const prefix = data[0];
			let coords = [];

			switch(prefix) {

				case "v":
					coords = data.slice(1);
					objData.vertecies.push([
						+coords[0],
						+coords[1],
						+coords[2]
					]);
					break;

				case "vt":
					coords = data.slice(1);
					objData.uvs.push([
						+coords[0],
						+coords[1]
					]);
					break;

				case "f":
					coords = data.slice(1);
					objData.indecies.push([
						coords[0],
						coords[1]
					]);
					break;
			}
		}

		return objData;
	}

}
