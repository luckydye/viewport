import { Geometry } from "../scene/Geometry";

export class Terrain extends Geometry {

	static get attributes() {
		return [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" }
		]
	}

	onCreate({ 
		// smoothness = 0.01,
		// resolution = 25,
		// height = 2000,
		// size = 400,
		// seed = Math.random(),
		smoothness = 0,
		resolution = 25,
		height = 0,
		size = 400,
		seed = Math.random(),
	} = {}) {
		this.smoothness = smoothness;
		this.resolution = resolution;
		this.height = height;
		this.size = parseInt(size);
		this.seed = seed;
	}

	generate() {
		const size = this.size;
		const vertArray = [];

		const heightmap = this.heightMap(size, size);

		for(let x = 0; x < heightmap.length; x++) {
			for(let z = 0; z < heightmap[x].length; z++) {
				try {
					const res = this.resolution;
					const s = res / 2;
					const dz = (res * z) - (res * heightmap.length / 2);
					const dx = (res * x) - (res * heightmap[x].length / 2);
					const topl = heightmap[x-1][z-1];
					const topr = heightmap[x][z-1];
					const botr = heightmap[x][z];
					const botl = heightmap[x-1][z];
					const verts = [
						s + dx, botr, s + dz, (1 / size) * x, (1 / size) * z,
						s + dx, topr, -s + dz, (1 / size) * x, (1 / size) * z,
						-s + dx, topl, -s + dz, (1 / size) * x, (1 / size) * z,
	
						-s + dx, topl, -s + dz, (1 / size) * x, (1 / size) * z,
						-s + dx, botl, s + dz, (1 / size) * x, (1 / size) * z,
						s + dx, botr, s + dz, (1 / size) * x, (1 / size) * z,
					]
					vertArray.push(...verts);
				} catch(err) {}
			}
		}

		return vertArray;
	}

	heightMap(width, height) {
		const verts = new Array(width);

		for(let x = 0; x < width; x++) {
			if(!verts[x]) {
				verts[x] = new Array(height);
			}
			for(let y = 0; y < height; y++) {
				const noiseValue = 0;
				verts[x][y] = -noiseValue;
			}
		}
		return verts;
	}

}