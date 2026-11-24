import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "../metadata";

describe("serializeJsonLd", () => {
	it("keeps JSON data while preventing a script end tag", () => {
		const payload = { headline: '</script><script>alert("x")</script>' };
		const serialized = serializeJsonLd(payload);
		expect(serialized).not.toContain("<");
		expect(JSON.parse(serialized)).toEqual(payload);
	});
});
