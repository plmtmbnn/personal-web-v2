import { z } from "zod";

export const contactFormSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Name must be at least 2 characters long." })
		.max(100, { message: "Name cannot exceed 100 characters." }),
	email: z.string().email({ message: "Please provide a valid email address." }),
	subject: z.enum(
		["Collaboration", "Consulting", "Say Hello", "Tech Discussion"],
		{
			message: "Please select a valid subject.",
		},
	),
	message: z
		.string()
		.min(10, { message: "Message must be at least 10 characters long." })
		.max(2000, { message: "Message cannot exceed 2000 characters." }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface ActionResponse {
	success: boolean;
	message: string;
	errors?: {
		[K in keyof ContactFormData]?: string[];
	};
}
