import type { Movement } from "../types";

export const INITIAL_MOVEMENT_LIBRARY: Movement[] = [
	{
		id: "slow-squat",
		name: "Slow Bodyweight Squat",
		category: "lower-body",
		instructions:
			"Perform controlled squats with comfortable depth and stable knees. Focus on a 3-second lowering tempo, pause slightly at the bottom, and drive smoothly back up through your midfoot.",
		targetReps: 10,
		tempo: "3s lowering phase (controlled eccentric)",
		estimatedDuration: "1 min",
		primaryMuscles: "Quadriceps & Glutes",
		referenceUrl:
			"https://www.google.com/search?q=how+to+do+bodyweight+squat+proper+form",
	},
	{
		id: "calf-raise",
		name: "Standing Calf Raise",
		category: "lower-body",
		instructions:
			"Raise the heels slowly to maximum ankle extension, pause briefly for 1 second at the top, and lower under control back to the floor. Maintain light balance on a wall or desk if needed.",
		targetReps: 18,
		tempo: "1s rise, 1s pause at peak, 2s lower",
		estimatedDuration: "1 min",
		primaryMuscles: "Calves (Gastrocnemius & Soleus)",
		referenceUrl:
			"https://www.google.com/search?q=how+to+do+standing+calf+raise+proper+form",
	},
	{
		id: "desk-pushup",
		name: "Desk or Wall Push-up",
		category: "upper-body",
		instructions:
			"Place hands slightly wider than shoulder-width on a sturdy desk edge or flat wall. Keep core braced in a straight plank line, lower chest toward the surface, and push firmly away.",
		targetReps: 10,
		tempo: "2s down, 1s press",
		estimatedDuration: "1 min",
		primaryMuscles: "Chest, Shoulders & Triceps",
		referenceUrl:
			"https://www.google.com/search?q=how+to+do+wall+push+up+proper+form",
	},
	{
		id: "glute-bridge",
		name: "Glute Bridge",
		category: "core",
		instructions:
			"Lie face up with knees bent and feet flat on the floor. Squeeze your glutes, lift hips until thighs and torso align, hold for 2 seconds at the top, and lower with control without hyperextending your lumbar spine.",
		targetReps: 12,
		tempo: "2s raise, 2s peak squeeze, 2s lower",
		estimatedDuration: "1–2 min",
		primaryMuscles: "Glutes & Posterior Chain",
		referenceUrl:
			"https://www.google.com/search?q=how+to+do+glute+bridge+proper+form",
	},
	{
		id: "standing-march",
		name: "Standing March",
		category: "mobility",
		instructions:
			"March in place with upright posture at a rhythmic, relaxed pace. Lift each knee toward hip height, pump arms naturally, and focus on light breathing to stimulate systemic circulation.",
		targetSeconds: 45,
		estimatedDuration: "1 min",
		primaryMuscles: "Hip Flexors, Core & Cardiovascular Circulation",
		referenceUrl:
			"https://www.google.com/search?q=standing+march+exercise+demonstration",
	},
	{
		id: "sit-to-stand",
		name: "Sit-to-Stand",
		category: "lower-body",
		instructions:
			"Sit tall on a standard desk chair with feet flat and hip-width apart. Stand up smoothly without using hands for assistance, pause upright, then sit back down with controlled hip hinge.",
		targetReps: 10,
		tempo: "2s standing, 2s sitting descent",
		estimatedDuration: "1 min",
		primaryMuscles: "Quadriceps, Glutes & Hip Stability",
		referenceUrl:
			"https://www.google.com/search?q=how+to+do+sit+to+stand+exercise+proper+form",
	},
	{
		id: "standing-hip-extension",
		name: "Standing Hip Extension",
		category: "lower-body",
		instructions:
			"Stand upright holding a chair or desk for balance. Keeping your torso stable and avoiding lumbar arching, gently squeeze one glute to move the leg straight backward. Complete 10 reps per side.",
		targetReps: 10,
		tempo: "2s hold at full glute squeeze per leg",
		estimatedDuration: "1–2 min",
		primaryMuscles: "Gluteus Maximus & Hip Extensors",
		referenceUrl:
			"https://www.google.com/search?q=standing+hip+extension+exercise+proper+form",
	},
	{
		id: "easy-walking",
		name: "Easy Walking Break",
		category: "walking",
		instructions:
			"Step away from screens and work surfaces. Walk at a relaxed, comfortable cadence around your office, home hallway, or outdoors. Great after meals to aid glucose clearance and reset mental focus.",
		targetSeconds: 600, // 10 minutes default
		estimatedDuration: "5–15 min",
		primaryMuscles: "Postural Chain, Circulation & Recovery",
		referenceUrl:
			"https://www.google.com/search?q=benefits+of+walking+after+meals",
	},
];
