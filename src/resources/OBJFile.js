import File from "./File.js";

export default class OBJFile extends File {

	static parseFile(strData) {
		const lines = strData.split(/\n/g);
		const objData = new OBJFile();

		objData.materials = [];

		let currentMaterial = null;

		for (let line of lines) {
			const data = line.split(" ");
			const prefix = data[0];
			let coords = [];

			switch (prefix) {

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

				case "vn":
					coords = data.slice(1);
					objData.normals.push([
						+coords[0],
						+coords[1],
						+coords[2]
					]);
					break;

				case "f":
					coords = data.slice(1);
					const face = [];
					for (let c of coords) {
						face.push(c.split('/').map(i => parseInt(i)));
					}
					face.material = objData.materials.indexOf(currentMaterial);
					objData.faces.push(face);
					break;

				case "usemtl":
					currentMaterial = data[1];
					objData.materials.push(data[1]);
					break;
			}
		}

		return objData;
	}
}
