import { Entity } from './Entity';
import { Cube } from '../geo/Cube';

const primit = new Cube();

export class Pointlight extends Entity {

	get isLight() {
		return true;
	}

	get vertecies() {
		return primit.vertecies;
	}

}