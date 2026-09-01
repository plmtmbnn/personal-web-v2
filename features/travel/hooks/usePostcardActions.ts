import { useState, useCallback } from "react";
import type { Destination } from "../types";
import { renderPostcardToCanvas } from "../utils/postcardCanvas";

/**
 * Hook encapsulating postcard sticker export actions:
 * - Copy to clipboard as high-res PNG
 * - Download as PNG file
 */
export function usePostcardActions(destination: Destination | null) {
	const [isCopying, setIsCopying] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const [isLinkCopied, setIsLinkCopied] = useState(false);

	const buildFilename = useCallback(
		(dest: Destination) =>
			`passport-${dest.name.toLowerCase().replace(/\s+/g, "-")}.png`,
		[],
	);

	/** Copy direct share URL for this postcard to clipboard */
	const handleCopyLink = useCallback(async () => {
		if (!destination || isLinkCopied) return;
		if (typeof window === "undefined") return;

		const url = `${window.location.origin}/adventures/travel?postcard=${destination.id}`;

		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(url);
			} else {
				const textarea = document.createElement("textarea");
				textarea.value = url;
				textarea.style.position = "fixed";
				textarea.style.opacity = "0";
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
			}
			setIsLinkCopied(true);
			setTimeout(() => setIsLinkCopied(false), 2400);
		} catch (err) {
			console.error("Failed to copy postcard share link:", err);
		}
	}, [destination, isLinkCopied]);

	/** Copy rendered postcard to clipboard as PNG, fallback to download */
	const handleCopy = useCallback(async () => {
		if (!destination || isCopying) return;
		setIsCopying(true);

		try {
			const canvas = await renderPostcardToCanvas(destination, 2);

			await new Promise<void>((resolve, reject) => {
				canvas.toBlob(async (blob) => {
					if (!blob) {
						reject(new Error("Canvas blob conversion failed"));
						return;
					}

					try {
						if (
							typeof ClipboardItem !== "undefined" &&
							navigator.clipboard?.write
						) {
							await navigator.clipboard.write([
								new ClipboardItem({ "image/png": blob }),
							]);
							setIsCopied(true);
							setTimeout(() => setIsCopied(false), 2400);
							resolve();
						} else {
							// Fallback: download instead
							const link = document.createElement("a");
							link.download = buildFilename(destination);
							link.href = canvas.toDataURL("image/png");
							link.click();
							setIsCopied(true);
							setTimeout(() => setIsCopied(false), 2400);
							resolve();
						}
					} catch (_err) {
						// Fallback on clipboard write failure
						const link = document.createElement("a");
						link.download = buildFilename(destination);
						link.href = canvas.toDataURL("image/png");
						link.click();
						setIsCopied(true);
						setTimeout(() => setIsCopied(false), 2400);
						resolve();
					}
				}, "image/png");
			});
		} catch (err) {
			console.error("Failed to copy postcard image to clipboard:", err);
		} finally {
			setIsCopying(false);
		}
	}, [destination, isCopying, buildFilename]);

	/** Download rendered postcard as PNG file */
	const handleDownload = useCallback(async () => {
		if (!destination || isDownloading) return;
		setIsDownloading(true);

		try {
			const canvas = await renderPostcardToCanvas(destination, 2);
			const link = document.createElement("a");
			link.download = buildFilename(destination);
			link.href = canvas.toDataURL("image/png");
			link.click();
		} catch (err) {
			console.error("Failed to download postcard image:", err);
		} finally {
			setIsDownloading(false);
		}
	}, [destination, isDownloading, buildFilename]);

	return {
		handleCopy,
		handleDownload,
		handleCopyLink,
		isCopying,
		isDownloading,
		isCopied,
		isLinkCopied,
	};
}
