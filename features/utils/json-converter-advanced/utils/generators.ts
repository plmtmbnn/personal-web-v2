const toPascalCase = (str: string) =>
	str
		.replace(/(_\w)/g, (m) => m[1].toUpperCase())
		.replace(/^./, (m) => m.toUpperCase())
		.replace(/[^a-zA-Z0-9]/g, "");

const toCamelCase = (str: string) =>
	str
		.replace(/(_\w)/g, (m) => m[1].toUpperCase())
		.replace(/^./, (m) => m.toLowerCase())
		.replace(/[^a-zA-Z0-9]/g, "");

const getType = (val: any) => {
	if (val === null) return "null";
	if (Array.isArray(val)) return "array";
	return typeof val;
};

export const generateTS = (obj: any, name: string): string => {
	const interfaces: string[] = [];

	const walk = (data: any, rootName: string): string => {
		const type = getType(data);
		if (type === "object") {
			const keys = Object.keys(data);
			const fields = keys
				.map((key) => {
					const valType = walk(data[key], toPascalCase(key));
					return `  ${key}: ${valType};`;
				})
				.join("\n");
			const interfaceName = toPascalCase(rootName);
			interfaces.push(`export interface ${interfaceName} {\n${fields}\n}`);
			return interfaceName;
		}
		if (type === "array") {
			if (data.length === 0) return "any[]";
			const itemType = walk(data[0], rootName);
			return `${itemType}[]`;
		}
		return type;
	};

	walk(obj, name);
	return interfaces.reverse().join("\n\n");
};

export const generateGo = (obj: any, name: string): string => {
	const structs: string[] = [];

	const walk = (data: any, rootName: string): string => {
		const type = getType(data);
		if (type === "object") {
			const keys = Object.keys(data);
			const fields = keys
				.map((key) => {
					const valType = walk(data[key], toPascalCase(key));
					const goName = toPascalCase(key);
					return `\t${goName} ${valType} \`json:"${key}"\``;
				})
				.join("\n");
			const structName = toPascalCase(rootName);
			structs.push(`type ${structName} struct {\n${fields}\n}`);
			return structName;
		}
		if (type === "array") {
			if (data.length === 0) return "[]interface{}";
			const itemType = walk(data[0], rootName);
			return `[]${itemType}`;
		}
		if (type === "string") return "string";
		if (type === "number") return "float64";
		if (type === "boolean") return "bool";
		return "interface{}";
	};

	walk(obj, name);
	return structs.reverse().join("\n\n");
};

export const generateMongoose = (obj: any, name: string): string => {
	const walk = (data: any): string => {
		const type = getType(data);
		if (type === "object") {
			const fields = Object.keys(data)
				.map((key) => `  ${key}: ${walk(data[key])}`)
				.join(",\n");
			return `{\n${fields}\n}`;
		}
		if (type === "array") {
			if (data.length === 0) return "[Schema.Types.Mixed]";
			return `[${walk(data[0])}]`;
		}
		if (type === "string") return "String";
		if (type === "number") return "Number";
		if (type === "boolean") return "Boolean";
		return "Schema.Types.Mixed";
	};

	return `const ${toPascalCase(name)}Schema = new Schema(${walk(obj)});`;
};

export const generateZod = (obj: any, name: string): string => {
	const walk = (data: any): string => {
		const type = getType(data);
		if (type === "object") {
			const fields = Object.keys(data)
				.map((key) => `  ${key}: ${walk(data[key])}`)
				.join(",\n");
			return `z.object({\n${fields}\n})`;
		}
		if (type === "array") {
			if (data.length === 0) return "z.array(z.any())";
			return `z.array(${walk(data[0])})`;
		}
		if (type === "string") return "z.string()";
		if (type === "number") return "z.number()";
		if (type === "boolean") return "z.boolean()";
		return "z.any()";
	};

	return `const ${toCamelCase(name)}Schema = ${walk(obj)};`;
};

export const generateJoi = (obj: any, name: string): string => {
	const walk = (data: any): string => {
		const type = getType(data);
		if (type === "object") {
			const fields = Object.keys(data)
				.map((key) => `  ${key}: ${walk(data[key])}`)
				.join(",\n");
			return `Joi.object({\n${fields}\n})`;
		}
		if (type === "array") {
			if (data.length === 0) return "Joi.array()";
			return `Joi.array().items(${walk(data[0])})`;
		}
		if (type === "string") return "Joi.string()";
		if (type === "number") return "Joi.number()";
		if (type === "boolean") return "Joi.boolean()";
		return "Joi.any()";
	};

	return `const ${toCamelCase(name)}Schema = ${walk(obj)};`;
};
