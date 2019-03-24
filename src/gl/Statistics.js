window.statistics = window.statistics || {};
const global = window.statistics;

export class Statistics {
	
	static get data() {
		return global;
	}

	static toText() {
		let str = '';
		const data = Statistics.data;
		for(let key in data) {
			str += `${key}: ${JSON.stringify(data[key])} <br/>`;
		}
		return str;
	}
}