import { Primitive } from "./Primitive";
import DefaultMaterial from "../materials/DefaultMaterial";

const DEFAULT_GUIDE_MATERIAL = new DefaultMaterial();

export class Vector extends Primitive {

	static get attributes() {
		return [
			{ size: 3, attribute: "aPosition" },
			{ size: 3, attribute: "aColor" },
		]
	}

	onCreate(args) {
		args.guide = true;
		args.material = DEFAULT_GUIDE_MATERIAL;
		args.drawmode = "LINE_STRIP";

        args.points = args.points || [];
		this.points = args.points;
		this.color = [0, 1, 0];
	}

	update() {
		this._buffer = null;
	}

	get vertecies() {
        const vertArray = [];
		for(let p of this.points) {
            const {x, y, z} = p;
			vertArray.push(x, y, z,	...this.color);
        }
		return vertArray;
	}

}
