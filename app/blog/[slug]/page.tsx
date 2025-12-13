import { notFound } from "next/navigation";
import ContentRenderer from "@/components/ContentRenderer";
import { BlogList } from "../blog-list";
// Note: You must ensure 'ContentRenderer' is imported and correctly defined as a Client Component.

// --- Type Definition ---
// FIX: The params property is now a Promise in Next.js 15+
type PageProps = {
	params: Promise<{
		slug: string;
	}>;
};

// --- Helper Function (Remains the same) ---
const calculateReadingTime = (content: string): number => {
	const plainText = content.replace(/<[^>]+>/g, "");
	const wordCount = plainText.split(/\s+/).filter(Boolean).length;
	return Math.ceil(wordCount / 200);
};

// --- Main Server Component ---
// FIX: The component must be async to use 'await'
export default async function BlogDetailPage({ params }: PageProps) {
	// FIX: Await the params Promise to get the actual object
	const resolvedParams = await params;
	const currentSlug = resolvedParams.slug; // Access the slug from the resolved object

	// 1. Fetch data on the server
	const post = BlogList.find((p) => p.slug === currentSlug);

	if (!post) {
		notFound();
	}

	// 2. Calculate reading time on the server
	const readingTime = calculateReadingTime(post.content);

	return (
		<article className="max-w-4xl mx-auto px-4 py-12">
			<h1 className="text-4xl font-bold mb-2">{post.title}</h1>
			<div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
				<time dateTime={post.date} className="font-medium text-gray-700">
					{post.date}
				</time>

				<span className="h-1 w-1 rounded-full bg-indigo-400" />

				<span className="font-medium text-gray-700">
					{readingTime} min read
				</span>
			</div>

			{/* Content Body - Uses the Client Component for secure rendering */}
			<ContentRenderer content={post.content} />
		</article>
	);
}

// --- Optional: Generate Static Params for SSG ---
// If you want to statically pre-render all blog posts at build time (recommended for blogs),
// you should also include the generateStaticParams function.
export async function generateStaticParams() {
	// Replace this with your actual data fetching logic (e.g., fetch from a CMS)
	const slugs = BlogList.map((post) => ({
		slug: post.slug,
	}));

	// This tells Next.js which pages to build statically
	return slugs; //
}
