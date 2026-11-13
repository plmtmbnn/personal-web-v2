import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";

const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal"];

function isPrivateIpv4(address: string): boolean {
	const octets = address.split(".").map(Number);
	if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part))) {
		return true;
	}

	const [a, b] = octets;
	return (
		a === 0 ||
		a === 10 ||
		a === 127 ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168) ||
		(a === 192 && b === 0) ||
		(a === 198 && (b === 18 || b === 19)) ||
		(a === 100 && b >= 64 && b <= 127) ||
		a >= 224
	);
}

function isPrivateIpv6(address: string): boolean {
	const normalized = address.toLowerCase().split("%")[0];
	const [first, second] = normalized.split(":");
	const prefix = Number.parseInt(first, 16);
	return (
		!(prefix >= 0x2000 && prefix <= 0x3fff) ||
		prefix === 0x2002 ||
		(prefix === 0x2001 && Number.parseInt(second || "0", 16) < 0x200)
	);
}

export function isPrivateIpAddress(address: string): boolean {
	const version = isIP(address);
	if (version === 4) return isPrivateIpv4(address);
	if (version === 6) return isPrivateIpv6(address);
	return true;
}

async function resolveExternalUrl(value: string) {
	const url = new URL(value);
	if (!["http:", "https:"].includes(url.protocol)) {
		throw new Error("Only HTTP and HTTPS URLs are allowed");
	}
	if (url.username || url.password) {
		throw new Error("URL credentials are not allowed");
	}

	const hostname = url.hostname
		.toLowerCase()
		.replace(/^\[|\]$/g, "")
		.replace(/\.$/, "");
	if (
		hostname === "localhost" ||
		BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
	) {
		throw new Error("Private network URLs are not allowed");
	}

	const addresses = isIP(hostname)
		? [{ address: hostname }]
		: await lookup(hostname, { all: true, verbatim: true });
	if (
		!addresses.length ||
		addresses.some(({ address }) => isPrivateIpAddress(address))
	) {
		throw new Error("Private network URLs are not allowed");
	}

	return { url, hostname, address: addresses[0].address };
}

export async function assertSafeExternalUrl(value: string): Promise<URL> {
	return (await resolveExternalUrl(value)).url;
}

export async function inspectExternalRedirect(value: string) {
	const { url, hostname, address } = await resolveExternalUrl(value);
	const request = url.protocol === "https:" ? httpsRequest : httpRequest;

	return new Promise<{ status: number; location?: string }>(
		(resolve, reject) => {
			const outgoing = request(
				{
					hostname: address,
					port: url.port || undefined,
					path: url.pathname + url.search,
					method: "HEAD",
					headers: { host: url.host },
					servername: isIP(hostname) ? undefined : hostname,
					signal: AbortSignal.timeout(4000),
					agent: false,
				},
				(response) => {
					response.resume();
					resolve({
						status: response.statusCode ?? 0,
						location: response.headers.location,
					});
				},
			);
			outgoing.on("error", reject);
			outgoing.end();
		},
	);
}
