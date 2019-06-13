import { Vec } from "../Math";
import { Guide } from "./Guide";
import { Loader } from "../Loader";
import { Resources } from "../Resources";

Resources.add({
    'cursor_model': 'models/cursor.obj',
}, false);

export class Cursor extends Guide {

	onCreate(args) {
		super.onCreate(args);
		args.drawmode = "TRIANGLES";
		args.id = 1;
		this.scale = 32;

		this.cursorVerts = Loader.loadObjFile(Resources.get('cursor_model'));
	}

	get vertecies() {
		const s = 0.75;

		let { x, y, z } = new Vec();

		return [
			x + s, y, z,	0, 0,	0, 0, 1,
			x, y, z + s,	0, 0,	0, 0, 1,
			x, y, z,		0, 0,	0, 0, 1,

			x, y, z + s,	0, 0,	0, 1, 0,
			x, y + s, z,	0, 0,	0, 1, 0,
			x, y, z,		0, 0,	0, 1, 0,
			
			x, y, z,		0, 0,	1, 0, 0,
			x, y + s, z,	0, 0,	1, 0, 0,
			x + s, y, z,	0, 0,	1, 0, 0,

			...this.cursorVerts
		];
	}

}
