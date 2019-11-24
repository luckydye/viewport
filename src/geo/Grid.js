import { Guide } from "./Guide.js";
import PrimitivetMaterial from '../materials/PrimitiveMaterial.js';

export class Grid extends Guide {

	get vertecies() {
		return this.generate(this.size, this.count);
	}

	constructor(size, count) {
		super();
		this.size = size;
		this.count = count;
		this.guide = true;
		this.name = "Grid";
	}

	onCreate(args) {
		args.material = new PrimitivetMaterial();
	}

	generate(w = 1, s = 20) {
		const dataArray = [];
		const size = w * (s / 2);
		for (let x = -s / 2; x <= s / 2; x++) {
			let color = [0.0, 0.0, 0.0];
			if (x == 0) color = [.1, .1, 0.75];

			dataArray.push(...[
				w * x, 0, size, 0, 0, 0, ...color,
				w * x, 0, -size, 0, 0, 0, ...color
			])
		}
		for (let z = -s / 2; z <= s / 2; z++) {
			let color = [0.0, 0.0, 0.0];
			if (z == 0) color = [0.75, .1, .1];

			dataArray.push(...[
				size, 0, w * z, 0, 0, 0, ...color,
				-size, 0, w * z, 0, 0, 0, ...color
			])
		}
		return dataArray;
	}
}
