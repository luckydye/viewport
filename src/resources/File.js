export default class File {

    constructor() {
        this.vertecies = [];
        this.uvs = [];
        this.faces = [];
        this.normals = [];
    }

	static parseFile(strData) {
		const fileData = new File();
		return fileData;
	}

}
