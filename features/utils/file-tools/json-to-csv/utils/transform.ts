import Papa from "papaparse";

export interface JsonToCsvOptions {
	delimiter?: string;
	bom?: boolean;
	quotes?: boolean;
	arrayPath?: string;
	mergeParentFields?: boolean;
	excludedIndices?: number[];
	excludedColumns?: string[];
}

export interface CandidateArray {
	path: string;
	count: number;
	data: unknown[];
	isObjectArray: boolean;
	isCombined?: boolean;
	sourceKeys?: string[];
}

export interface ExtractedRecordDetails {
	records: Record<string, unknown>[];
	detectedPath: string;
	candidatePaths: CandidateArray[];
}

export interface JsonToCsvResult {
	csv: string;
	headers: string[];
	allHeaders: string[];
	rows: Record<string, unknown>[];
	rowIndices: number[];
	totalRows: number;
	detectedPath: string;
	candidatePaths: CandidateArray[];
}

/**
 * Recursively flattens nested object properties into dot notation (e.g., user.address.city).
 * Serializes arrays and complex child structures into JSON strings to protect data integrity.
 */
export function flattenObject(
	obj: unknown,
	prefix = "",
): Record<string, unknown> {
	if (obj === null || obj === undefined) {
		return prefix ? { [prefix]: "" } : {};
	}

	if (typeof obj !== "object") {
		return prefix ? { [prefix]: obj } : {};
	}

	if (obj instanceof Date) {
		return prefix ? { [prefix]: obj.toISOString() } : {};
	}

	if (Array.isArray(obj)) {
		return prefix ? { [prefix]: JSON.stringify(obj) } : {};
	}

	const result: Record<string, unknown> = {};
	const entries = Object.entries(obj as Record<string, unknown>);

	if (entries.length === 0 && prefix) {
		return { [prefix]: "{}" };
	}

	for (const [key, value] of entries) {
		const newKey = prefix ? `${prefix}.${key}` : key;

		if (
			value !== null &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			!(value instanceof Date)
		) {
			const nested = flattenObject(value, newKey);
			Object.assign(result, nested);
		} else if (Array.isArray(value)) {
			result[newKey] = JSON.stringify(value);
		} else {
			result[newKey] = value ?? "";
		}
	}

	return result;
}

/**
 * Breadth-First Search (BFS) to discover candidate arrays in the JSON hierarchy.
 * Prioritizes:
 * 1. Arrays of objects over arrays of scalar primitives
 * 2. Outermost (shallowest level) arrays first
 * 3. Higher element count as tie-breaker
 */
export function findCandidateArrays(
	raw: unknown,
	maxDepth = 6,
): CandidateArray[] {
	if (!raw || typeof raw !== "object") return [];

	if (Array.isArray(raw)) {
		const isObjArray =
			raw.length > 0 &&
			raw.some(
				(item) =>
					item !== null && typeof item === "object" && !Array.isArray(item),
			);
		return [
			{
				path: "root",
				count: raw.length,
				data: raw,
				isObjectArray: isObjArray,
			},
		];
	}

	const candidates: CandidateArray[] = [];
	const queue: Array<{
		val: Record<string, unknown>;
		path: string;
		depth: number;
	}> = [{ val: raw as Record<string, unknown>, path: "", depth: 0 }];

	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) break;
		if (current.depth > maxDepth) continue;

		// 1. Collect all direct array properties at this level
		const directArrays: Array<{
			key: string;
			val: unknown[];
			isObjArray: boolean;
		}> = [];

		for (const [key, value] of Object.entries(current.val)) {
			if (Array.isArray(value)) {
				const isObjArray =
					value.length > 0 &&
					value.some(
						(item) =>
							item !== null && typeof item === "object" && !Array.isArray(item),
					);
				directArrays.push({ key, val: value, isObjArray });
			}
		}

		// 2. If multiple sibling arrays of objects exist at this exact level, create a combined table candidate
		const objectArrays = directArrays.filter((a) => a.isObjArray);
		const targetArrays =
			objectArrays.length > 1
				? objectArrays
				: directArrays.length > 1 && objectArrays.length === 0
					? directArrays
					: [];

		if (targetArrays.length > 1) {
			const combinedData: Record<string, unknown>[] = [];
			for (const entry of targetArrays) {
				for (const item of entry.val) {
					if (
						item !== null &&
						typeof item === "object" &&
						!Array.isArray(item)
					) {
						combinedData.push({
							_source_key: entry.key,
							...(item as Record<string, unknown>),
						});
					} else {
						combinedData.push({
							_source_key: entry.key,
							value: item,
						});
					}
				}
			}

			const combinedPath = current.path
				? `${current.path} (all arrays)`
				: "root (all arrays)";

			candidates.push({
				path: combinedPath,
				count: combinedData.length,
				data: combinedData,
				isObjectArray: true,
				isCombined: true,
				sourceKeys: targetArrays.map((a) => a.key),
			});
		}

		// 3. Add individual array candidates and enqueue child objects
		for (const [key, value] of Object.entries(current.val)) {
			const currentPath = current.path ? `${current.path}.${key}` : key;

			if (Array.isArray(value)) {
				const isObjArray =
					value.length > 0 &&
					value.some(
						(item) =>
							item !== null && typeof item === "object" && !Array.isArray(item),
					);

				candidates.push({
					path: currentPath,
					count: value.length,
					data: value,
					isObjectArray: isObjArray,
				});
			} else if (
				value !== null &&
				typeof value === "object" &&
				!(value instanceof Date)
			) {
				queue.push({
					val: value as Record<string, unknown>,
					path: currentPath,
					depth: current.depth + 1,
				});
			}
		}
	}

	// Sort candidates:
	// 1. Shallower level (outermost hierarchy) first
	// 2. Combined table at the same hierarchy level comes first
	// 3. Object arrays before primitive arrays
	// 4. Higher row count as tie-breaker
	candidates.sort((a, b) => {
		const getContainerDepth = (p: string) => {
			const clean = p.replace(/ \(all arrays\)$/, "");
			return clean === "root" ? 0 : clean.split(".").length;
		};

		const depthA = getContainerDepth(a.path);
		const depthB = getContainerDepth(b.path);

		if (depthA !== depthB) {
			return depthA - depthB;
		}

		if (Boolean(a.isCombined) !== Boolean(b.isCombined)) {
			return a.isCombined ? -1 : 1;
		}

		if (a.isObjectArray !== b.isObjectArray) {
			return a.isObjectArray ? -1 : 1;
		}

		return b.count - a.count;
	});

	return candidates;
}

/**
 * Extracts non-array ancestor and sibling properties from the JSON object
 * so parent context can optionally be merged into each extracted array row.
 */
export function extractParentContext(
	raw: Record<string, unknown>,
	targetPath: string,
): Record<string, unknown> {
	const cleanPath = targetPath.replace(/ \(all arrays\)$/, "");
	if (!cleanPath || cleanPath === "root" || cleanPath === "root object") {
		return {};
	}

	const parts = cleanPath.split(".");
	const parentFields: Record<string, unknown> = {};

	function collect(current: unknown, currentPrefix: string, pathIndex: number) {
		if (!current || typeof current !== "object" || Array.isArray(current)) {
			return;
		}

		const isTargetLevel = pathIndex === parts.length;
		if (isTargetLevel) {
			for (const [k, v] of Object.entries(current as Record<string, unknown>)) {
				if (!Array.isArray(v)) {
					const prefix = currentPrefix ? `${currentPrefix}.${k}` : k;
					if (v !== null && typeof v === "object") {
						const flat = flattenObject(v, prefix);
						Object.assign(parentFields, flat);
					} else {
						parentFields[prefix] = v ?? "";
					}
				}
			}
			return;
		}

		const targetKey = parts[pathIndex];
		for (const [k, v] of Object.entries(current as Record<string, unknown>)) {
			const prefix = currentPrefix ? `${currentPrefix}.${k}` : k;
			if (k === targetKey) {
				collect(v, prefix, pathIndex + 1);
			} else {
				if (v !== null && typeof v === "object" && !Array.isArray(v)) {
					const flat = flattenObject(v, prefix);
					Object.assign(parentFields, flat);
				} else if (!Array.isArray(v)) {
					parentFields[prefix] = v ?? "";
				}
			}
		}
	}

	collect(raw, "", 0);
	return parentFields;
}

/**
 * Extracts candidate records along with path metadata.
 */
export function extractRecordDetails(
	raw: unknown,
	customPath?: string,
): ExtractedRecordDetails {
	if (!raw) {
		return { records: [], detectedPath: "", candidatePaths: [] };
	}

	const candidates = findCandidateArrays(raw);

	if (customPath) {
		const match = candidates.find((c) => c.path === customPath);
		if (match) {
			const records = match.data.map((item) => {
				if (item !== null && typeof item === "object" && !Array.isArray(item)) {
					return item as Record<string, unknown>;
				}
				return { value: item };
			});
			return {
				records,
				detectedPath: match.path,
				candidatePaths: candidates,
			};
		}
	}

	if (candidates.length > 0) {
		const best = candidates[0];
		const records = best.data.map((item) => {
			if (item !== null && typeof item === "object" && !Array.isArray(item)) {
				return item as Record<string, unknown>;
			}
			return { value: item };
		});
		return {
			records,
			detectedPath: best.path,
			candidatePaths: candidates,
		};
	}

	// Single record object with no nested arrays
	if (typeof raw === "object" && !Array.isArray(raw)) {
		return {
			records: [raw as Record<string, unknown>],
			detectedPath: "root object",
			candidatePaths: [],
		};
	}

	return {
		records: [{ value: raw }],
		detectedPath: "scalar",
		candidatePaths: [],
	};
}

/**
 * Standard array extractor for backward compatibility.
 */
export function extractRecordArray(
	raw: unknown,
	customPath?: string,
): Record<string, unknown>[] {
	return extractRecordDetails(raw, customPath).records;
}

/**
 * Converts parsed JSON data into CSV with smart outermost array detection,
 * flattened dot-notation headers, delimiter customization, and optional Excel UTF-8 BOM encoding.
 */
export function convertJsonToCsv(
	input: unknown,
	options: JsonToCsvOptions = {},
): JsonToCsvResult {
	const details = extractRecordDetails(input, options.arrayPath);
	if (details.records.length === 0) {
		return {
			csv: "",
			headers: [],
			allHeaders: [],
			rows: [],
			rowIndices: [],
			totalRows: 0,
			detectedPath: "",
			candidatePaths: [],
		};
	}

	const excludedSet = new Set(options.excludedIndices ?? []);
	const activeRecords: Record<string, unknown>[] = [];
	const rowIndices: number[] = [];

	details.records.forEach((record, index) => {
		if (!excludedSet.has(index)) {
			activeRecords.push(record);
			rowIndices.push(index);
		}
	});

	if (activeRecords.length === 0) {
		return {
			csv: "",
			headers: [],
			allHeaders: [],
			rows: [],
			rowIndices: [],
			totalRows: 0,
			detectedPath: details.detectedPath,
			candidatePaths: details.candidatePaths,
		};
	}

	const parentContext =
		options.mergeParentFields &&
		input !== null &&
		typeof input === "object" &&
		!Array.isArray(input)
			? extractParentContext(
					input as Record<string, unknown>,
					details.detectedPath,
				)
			: {};

	const flattenedRows = activeRecords.map((record) => {
		const target =
			Object.keys(parentContext).length > 0
				? { ...parentContext, ...record }
				: record;
		return flattenObject(target);
	});

	// Collect unique ordered headers across all rows
	const headerSet = new Set<string>();
	for (const row of flattenedRows) {
		for (const key of Object.keys(row)) {
			headerSet.add(key);
		}
	}
	const allHeaders = Array.from(headerSet);
	const excludedColSet = new Set(options.excludedColumns ?? []);
	const headers = allHeaders.filter((h) => !excludedColSet.has(h));

	// Ensure all rows contain all active headers for uniform tabular shape
	const normalizedRows = flattenedRows.map((row) => {
		const fullRow: Record<string, unknown> = {};
		for (const header of headers) {
			const val = row[header];
			fullRow[header] = val !== undefined && val !== null ? val : "";
		}
		return fullRow;
	});

	const delimiter = options.delimiter || ",";
	const csvBody = Papa.unparse(
		{
			fields: headers,
			data: normalizedRows.map((row) =>
				headers.map((h) => {
					const val = row[h];
					if (typeof val === "object" && val !== null) {
						return JSON.stringify(val);
					}
					return val;
				}),
			),
		},
		{
			delimiter,
			quotes: options.quotes ?? false,
			skipEmptyLines: false,
		},
	);

	const prefix = options.bom ? "\uFEFF" : "";
	const csv = `${prefix}${csvBody}`;

	return {
		csv,
		headers,
		allHeaders,
		rows: normalizedRows,
		rowIndices,
		totalRows: normalizedRows.length,
		detectedPath: details.detectedPath,
		candidatePaths: details.candidatePaths,
	};
}
