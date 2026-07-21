/**
 * Sets a value in a nested object using dot notation
 * e.g. setDeep(obj, 'user.name', 'Polma')
 */
export const setDeep = (obj: any, path: string, value: any) => {
	const keys = path.split(".");
	let current = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (!current[key]) current[key] = {};
		current = current[key];
	}
	current[keys[keys.length - 1]] = value;
};

/**
 * Transforms flat objects into nested objects based on dot notation keys
 */
export const transformToNested = (data: any[]) => {
	return data.map((row) => {
		const newRow: any = {};
		for (const [key, value] of Object.entries(row)) {
			if (key.includes(".")) {
				setDeep(newRow, key, value);
			} else {
				newRow[key] = value;
			}
		}
		return newRow;
	});
};
