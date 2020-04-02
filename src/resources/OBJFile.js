export default class OBJFile {

	constructor() {
        this.vertecies = [];
        this.uvs = [];
        this.faces = [];
        this.normals = [];
	}
	
	getVertecies() {
        const vertecies = [];

        let face = null;
        let fface = null;

        try {
            this.faces.forEach((f, i) => {
                for (let i = 0; i < 3; i++) {
                    fface = f;
                    face = f[i];

                    const vertex = this.vertecies[face[0] - 1];
                    const uv = this.uvs[face[1] - 1];
                    const normal = this.normals[face[2] - 1];

                    if (vertex && normal) {
                        vertecies.push(
                            vertex[0],
                            vertex[1],
                            vertex[2],

                            uv ? uv[0] : 0,
                            uv ? uv[1] : 0,
                            0,

                            normal[0],
                            normal[1],
                            normal[2],
                        );
                    }
                }
                if (f.length > 3) {
                    [2, 3, 0].forEach(i => {
                        face = f[i];

                        const vertex = this.vertecies[face[0] - 1];
                        const uv = this.uvs[face[1] - 1];
                        const normal = this.normals[face[2] - 1];

                        if (vertex && uv && normal) {
                            vertecies.push(
                                vertex[0],
                                vertex[1],
                                vertex[2],

                                uv[0],
                                uv[1],
                                fface.material,

                                normal[0],
                                normal[1],
                                normal[2],
                            );
                        }
                    })
                }
            });

        } catch (err) {
            console.error(err);
        }

        return vertecies;
    }

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

        const vertecies = [];
        const uvs = [];
        const normals = [];
        const indecies = [];

        for(let face of objData.faces) {
            for(let index of face) {
                const vertex = index[0] - 1;
                const uv = index[1] - 1;
                const normal = index[2] - 1;

                indecies.push(vertex);

                vertecies[vertex] = objData.vertecies[vertex];
                uvs[vertex] = objData.uvs[uv];
                normals[vertex] = objData.normals[normal];
            }
        }

		return {
            indecies: indecies,
            vertecies: vertecies,
            uvs: uvs,
            normals: normals,
        };
	}
}
