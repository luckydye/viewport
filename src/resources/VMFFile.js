import File from "./File";

export default class VMFFile extends File {

	static parseFile(strData) {
		const lines = strData.split(/\n/g);
		const fileData = new VMFFile();

		for(let line of lines) {
			
		}

		return fileData;
	}

}
