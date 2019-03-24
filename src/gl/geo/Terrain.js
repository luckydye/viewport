import noise from '../../../lib/perlin.js';
import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../graphics/VertexBuffer.js";

export class Terrain extends Geometry {

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

	createBuffer() {
		const vertArray = this.generate();
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "TRIANGLES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" }
		]
		return vertxBuffer;
	}

	generate() {
		const size = this.size;
		const vertArray = [];

		const heightmap = this.heightMap(size, size, this.smoothness, this.height);
		const heightmap2 = this.heightMap(size, size, 0.99, 200);

		// const heightmap = this.mergeMap(heightmap1, heightmap2);

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

	heightMap(width, height, freq, terrainheight) {
		const verts = new Array(width);
		
		noise.seed(this.seed);
		
		for(let x = 0; x < width; x++) {
			if(!verts[x]) {
				verts[x] = new Array(height);
			}
			for(let y = 0; y < height; y++) {
				const noiseValue = noise.perlin2(x * freq, y * freq) * terrainheight;
				verts[x][y] = -noiseValue;
			}
		}
		return verts;
	}

	mergeMap(map1, map2) {
		const verts = new Array(map1.length);
		for(let x = 0; x < map1.length; x++) {
			if(!verts[x]) {
				verts[x] = new Array(map1[x].length);
			}
			for(let y = 0; y < verts[x].length; y++) {
				const noiseValue = map1[x][y] + map2[x][y];
				verts[x][y] = noiseValue;
			}
		}
		return verts;
	}

}