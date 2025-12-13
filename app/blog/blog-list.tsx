import moment from "moment";

const formatedDate = (start: number, end: number) => {
	return `${moment("2025-07-06")
		.endOf("day")
		.add(start * (start < 1 ? 1 : 7) + 1, "day")
		.format("DD MMM")} - 
    ${moment("2025-07-06")
			.endOf("day")
			.add(end * (end < 1 ? 1 : 7), "day")
			.format("DD MMM")}
    ${moment("2025-07-06").format("YYYY")}`;
};

const passedPeriod = (startWeek: number, currentDay: number) => {
	const targetDay = moment(
		moment(new Date("2025-07-07"))
			.add(startWeek, "week")
			.add(currentDay, "days")
			.toDate(),
	);

	if (targetDay.startOf("days").isBefore(moment().startOf("day"))) {
		return "✅";
	}

	if (targetDay.isSame(moment().startOf("day"))) {
		return "🆕";
	}

	return "🔒";
};

export const BlogList = [
	{
		title: "🏃‍♂️ 21‑Week Marathon Training Plan",
		slug: "1",
		description:
			"🎯 Each week has one Rest day, easy runs (EZ), key workouts, long runs (LR), strength 🏋️‍♂️ and cross‑training 🚴.",
		date: "June 7, 2025",
		content: `

<body class="bg-gray-50 text-gray-800 font-sans leading-relaxed">

  <div class="max-w-3xl mx-auto p-6">
    <!-- Phase 1 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-green-700 mb-2">Phase 1 ▶ Base Building (Weeks 1–8) 🏗️</h2>
      <p class="mb-4">Build your aerobic base gradually. Easy pace runs, a weekly long run, strength twice, and cross‑training once. 🛠️</p>
      <div class="space-y-6">
        <hr /> <!-- Week 1 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 1 📍 [ ${formatedDate(0, 1)} ]</div> 
          <ul class="space-y-1 list-none">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(0, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 6 km EZ ${passedPeriod(0, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(0, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🏃 6 km EZ ${passedPeriod(0, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 6 km EZ ${passedPeriod(0, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 12 km LR ${passedPeriod(0, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train (45–60 min) ${passedPeriod(0, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 2 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 2 📍 [ ${formatedDate(1, 2)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(1, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 7 km EZ ${passedPeriod(1, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(1, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🏃 7 km EZ ${passedPeriod(1, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 7 km EZ ${passedPeriod(1, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 14 km LR ${passedPeriod(1, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(1, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 3 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 3 📍 [ ${formatedDate(2, 3)} ] </div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(2, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 8 km EZ ${passedPeriod(2, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(2, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🏃 8 km EZ ${passedPeriod(2, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 8 km EZ ${passedPeriod(2, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 16 km LR ${passedPeriod(2, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(2, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 4 (cutback) -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 4 <span class="text-sm text-gray-600">(cutback)</span> 📍 [ ${formatedDate(3, 4)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(3, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 6 km EZ ${passedPeriod(3, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(3, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🏃 6 km EZ ${passedPeriod(3, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 6 km EZ ${passedPeriod(3, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 12 km LR ${passedPeriod(3, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(3, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 5 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 5 📍 [ ${formatedDate(4, 5)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(4, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 9 km EZ ${passedPeriod(4, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(4, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🏃 9 km EZ ${passedPeriod(4, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 9 km EZ ${passedPeriod(4, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 18 km LR ${passedPeriod(4, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(4, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 6 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 6 📍 [ ${formatedDate(5, 6)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(5, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 10 km EZ ${passedPeriod(5, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(5, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🏃 10 km EZ ${passedPeriod(5, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 10 km EZ ${passedPeriod(5, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 20 km LR ${passedPeriod(5, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(5, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 7 (cutback) -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 7 <span class="text-sm text-gray-600">(cutback)</span> 📍 [ ${formatedDate(6, 7)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(6, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 8 km EZ ${passedPeriod(6, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(6, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🏃 8 km EZ ${passedPeriod(6, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 8 km EZ ${passedPeriod(6, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 16 km LR ${passedPeriod(6, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(6, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 8 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 8 📍 [ ${formatedDate(7, 8)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(7, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 11 km EZ ${passedPeriod(7, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(7, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🏃 11 km EZ ${passedPeriod(7, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 11 km EZ ${passedPeriod(7, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 22 km LR ${passedPeriod(7, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(7, 6)}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Phase 2 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-green-700 mb-2">Phase 2 ▶ Build (Weeks 9–14) 📈</h2>
      <p class="mb-4">Add structured workouts—tempo, intervals, and progression runs—to raise your stamina and pace. ⏱️</p>
      <div class="space-y-6">
        <hr /> <!-- Week 9 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 9 📍 [ ${formatedDate(8, 9)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(8, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 12 km EZ ${passedPeriod(8, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(8, 2)}</li>
            <li><span class="font-semibold">Thu:</span> ⏱️ Tempo 20′ @ 6:10–6:20 min/km ${passedPeriod(8, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 12 km EZ ${passedPeriod(8, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 24 km LR ${passedPeriod(8, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(8, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 10 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 10 📍 [ ${formatedDate(9, 10)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(9, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 10 km EZ ${passedPeriod(9, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(9, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🔥 Intervals 6×1 km @ 5:30 min/km ${passedPeriod(9, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 10 km EZ ${passedPeriod(9, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 26 km LR ${passedPeriod(9, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(9, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 11 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 11 📍 [ ${formatedDate(10, 11)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(10, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 14 km EZ ${passedPeriod(10, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(10, 2)}</li>
            <li><span class="font-semibold">Thu:</span> ⏱️ Tempo 25′ @ 6:10–6:20 min/km ${passedPeriod(10, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 14 km EZ ${passedPeriod(10, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 28 km LR ${passedPeriod(10, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(10, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 12 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 12 📍 [ ${formatedDate(11, 12)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(11, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 12 km EZ ${passedPeriod(11, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(11, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🔥 Intervals 8×800 m @ 5:20 min/km ${passedPeriod(11, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 12 km EZ ${passedPeriod(11, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🔄 Progression 18 km (10 km @ MP) ${passedPeriod(11, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(11, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 13 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 13 📍 [ ${formatedDate(12, 13)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(12, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 15 km EZ ${passedPeriod(12, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(12, 2)}</li>
            <li><span class="font-semibold">Thu:</span> ⏱️ Tempo 30′ @ 6:10–6:20 min/km ${passedPeriod(12, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 15 km EZ ${passedPeriod(12, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 30 km LR ${passedPeriod(12, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(12, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 14 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 14 📍 [ ${formatedDate(13, 14)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(13, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 12 km EZ ${passedPeriod(13, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(13, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🔥 Intervals 5×1 km @ 5:30 min/km ${passedPeriod(13, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 12 km EZ ${passedPeriod(13, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 32 km LR ${passedPeriod(13, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(13, 6)}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Phase 3 -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-green-700 mb-2">Phase 3 ▶ Peak (Weeks 15–18) 🚀</h2>
      <p class="mb-4">Hit your highest volume, simulate race conditions, and practice nutrition. 🏅</p>
      <div class="space-y-6">
        <hr /> <!-- Week 15 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 15 📍 [ ${formatedDate(14, 15)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(14, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 16 km EZ ${passedPeriod(14, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(14, 2)}</li>
            <li><span class="font-semibold">Thu:</span> ⏱️ Tempo 35′ @ 6:10–6:20 min/km ${passedPeriod(14, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 16 km EZ ${passedPeriod(14, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 34 km LR ${passedPeriod(14, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(14, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 16 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 16 📍 [ ${formatedDate(15, 16)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(15, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 14 km EZ ${passedPeriod(15, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(15, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🔥 Intervals 6×1 km @ 5:30 min/km ${passedPeriod(15, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 14 km EZ ${passedPeriod(15, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🔄 Progression 32 km (20 km @ MP) ${passedPeriod(15, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(15, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 17 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 17 📍 [ ${formatedDate(16, 17)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(16, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 18 km EZ ${passedPeriod(16, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(16, 2)}</li>
            <li><span class="font-semibold">Thu:</span> ⏱️ Tempo 40′ @ 6:10–6:20 min/km ${passedPeriod(16, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 18 km EZ ${passedPeriod(16, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 36 km LR ${passedPeriod(16, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(16, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 18 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 18 📍 [ ${formatedDate(17, 18)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(17, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 12 km EZ + strides ${passedPeriod(17, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Strength ${passedPeriod(17, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🔄 Progression 18 km (last 8 km @ MP) ${passedPeriod(17, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 12 km EZ + strides ${passedPeriod(17, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 32 km LR (race‑sim fueling & gear) ${passedPeriod(17, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(17, 6)}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Phase 4 -->
    <section>
      <h2 class="text-2xl font-semibold text-green-700 mb-2">Phase 4 ▶ Taper (Weeks 19–21) 🎯</h2>
      <p class="mb-4">Reduce volume, keep intensity short, and rest up for race day! 🎉</p>
      <div class="space-y-6">
        <hr /> <!-- Week 19 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 19 📍 [ ${formatedDate(18, 19)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(18, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 14 km EZ + strides ${passedPeriod(18, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Light strength ${passedPeriod(18, 2)}</li>
            <li><span class="font-semibold">Thu:</span> ⏱️ Tempo 20′ @ MP ${passedPeriod(18, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 14 km EZ ${passedPeriod(18, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 24 km LR ${passedPeriod(18, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(18, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 20 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 20 📍 [ ${formatedDate(19, 20)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(19, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 10 km EZ + strides ${passedPeriod(19, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Light strength ${passedPeriod(19, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🔄 Progression 8 km (4 km @ MP) ${passedPeriod(19, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 10 km EZ ${passedPeriod(19, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 16 km LR ${passedPeriod(19, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🚴 Cross‑train ${passedPeriod(19, 6)}</li>
          </ul>
        </div>
        <hr /> <!-- Week 21 -->
        <div>
          <div class="text-xl font-bold text-blue-400 mb-2">Week 21 📍 [ ${formatedDate(20, 21)} ]</div>
          <ul class="space-y-1">
            <li><span class="font-semibold">Mon:</span> 🛌 Rest ${passedPeriod(20, 0)}</li>
            <li><span class="font-semibold">Tue:</span> 🏃 8 km EZ + strides ${passedPeriod(20, 1)}</li>
            <li><span class="font-semibold">Wed:</span> 🏋️‍♂️ Light strength ${passedPeriod(20, 2)}</li>
            <li><span class="font-semibold">Thu:</span> 🏃 6 km EZ + strides ${passedPeriod(20, 3)}</li>
            <li><span class="font-semibold">Fri:</span> 🏃 8 km EZ ${passedPeriod(20, 4)}</li>
            <li><span class="font-semibold">Sat:</span> 🏃 4–6 km shake‑out run ${passedPeriod(20, 5)}</li>
            <li><span class="font-semibold">Sun:</span> 🏁 <strong>Race Day 42.195 km!</strong> ${passedPeriod(20, 6)}</li>
          </ul>
        </div>
      </div>
    </section>

  </div>
</body>
    `,
	},
	{
		title: "💪 Strength & 🤸 Mobility Routine",
		slug: "2",
		description:
			"Plug these into your Wednesday (Strength) and Thursday (Mobility) slots.",
		date: "June 6, 2025",
		content: `
<body class="bg-gray-50 text-gray-800 font-sans leading-relaxed">

  <div class="max-w-3xl mx-auto p-6">
    <p class="mb-8 text-lg text-center">Click the exercises 🔗 to search demos. Stay strong, mobile & marathon-ready! 🏃‍♂️</p>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-green-700 mb-4">🏋️‍♂️ Strength Training (2×/week)</h2>
      <p class="mb-4 text-sm text-gray-600">3 sets × 8–12 reps | Rest: 60–90s ⏱️</p>
      <ul class="list-disc list-inside space-y-3">
        <li>🏋️‍♂️ <a href="https://www.google.com/search?q=Goblet+Squat" target="_blank" class="text-blue-400 hover:underline">Goblet Squat</a> — Quads, glutes, core 🔥</li>
        <li>🦵 <a href="https://www.google.com/search?q=Romanian+Deadlift" target="_blank" class="text-blue-400 hover:underline">Romanian Deadlift</a> — Hamstrings & glutes power 💥</li>
        <li>🚶‍♂️ <a href="https://www.google.com/search?q=Walking+Lunges" target="_blank" class="text-blue-400 hover:underline">Walking Lunges</a> — Single-leg strength & balance ⚖️</li>
        <li>🙌 <a href="https://www.google.com/search?q=Push+Up+exercise" target="_blank" class="text-blue-400 hover:underline">Push-Up</a> — Upper body & core 🏋️</li>
        <li>🏋️‍♀️ <a href="https://www.google.com/search?q=Single+Arm+Row+exercise" target="_blank" class="text-blue-400 hover:underline">Single-Arm Row</a> — Back & posture 🦍</li>
        <li>🛡️ <a href="https://www.google.com/search?q=Plank+with+Shoulder+Tap" target="_blank" class="text-blue-400 hover:underline">Plank with Shoulder Tap</a> — Core control & anti-rotation 💪</li>
        <li>🍑 <a href="https://www.google.com/search?q=Glute+Bridge+March" target="_blank" class="text-blue-400 hover:underline">Glute Bridge March</a> — Glute & hip stability 🌉</li>
        <li>🌀 <a href="https://www.google.com/search?q=Side+Plank+with+Leg+Lift" target="_blank" class="text-blue-400 hover:underline">Side Plank + Leg Lift</a> — Core & hip strength 🔄</li>
        <li>🐞 <a href="https://www.google.com/search?q=Dead+Bug+exercise" target="_blank" class="text-blue-400 hover:underline">Dead Bug</a> — Core coordination 🧘‍♂️</li>
        <li>🪜 <a href="https://www.google.com/search?q=Step+Ups+with+weights" target="_blank" class="text-blue-400 hover:underline">Weighted Step-Ups</a> — Powerful legs & balance 🏃‍♂️</li>
        <li>🛒 <a href="https://www.google.com/search?q=Farmer+Carry+exercise" target="_blank" class="text-blue-400 hover:underline">Farmer's Carry</a> — Full-body strength & endurance 💪</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-purple-700 mb-4">🤸 Mobility Routine (2×/week)</h2>
      <p class="mb-4 text-sm text-gray-600">Hold each: 30–60 sec | Rest: minimal or as needed 🌬️</p>
      <ul class="list-disc list-inside space-y-3">
        <li>🦵 <a href="https://www.google.com/search?q=Hip+Flexor+Stretch" target="_blank" class="text-blue-400 hover:underline">Hip Flexor Stretch</a> — Open hips & ease tightness 🚀</li>
        <li>🕊️ <a href="https://www.google.com/search?q=Pigeon+Pose" target="_blank" class="text-blue-400 hover:underline">Pigeon Pose</a> — Deep glute stretch 🧘‍♀️</li>
        <li>🌎 <a href="https://www.google.com/search?q=World%27s+Greatest+Stretch" target="_blank" class="text-blue-400 hover:underline">World's Greatest Stretch</a> — Full-body mobility 🏆</li>
        <li>🧩 <a href="https://www.google.com/search?q=90+90+hip+mobility" target="_blank" class="text-blue-400 hover:underline">90/90 Hip Switch</a> — Hip mobility & control 🔄</li>
        <li>👟 <a href="https://www.google.com/search?q=Ankle+mobility+drill" target="_blank" class="text-blue-400 hover:underline">Ankle Mobility Drill</a> — Better ankle range & running form 🏃‍♀️</li>
        <li>🧱 <a href="https://www.google.com/search?q=Foam+Roller+Thoracic+Extension" target="_blank" class="text-blue-400 hover:underline">Thoracic Extension (Foam Roller)</a> — Upper back release 🌀</li>
        <li>🛋️ <a href="https://www.google.com/search?q=Couch+Stretch" target="_blank" class="text-blue-400 hover:underline">Couch Stretch</a> — Deep quad & hip stretch 🏹</li>
        <li>🦵 <a href="https://www.google.com/search?q=Hamstring+Stretch" target="_blank" class="text-blue-400 hover:underline">Hamstring Stretch</a> — Looser posterior chain 🌿</li>
        <li>🐈 <a href="https://www.google.com/search?q=Cat+Cow+Stretch" target="_blank" class="text-blue-400 hover:underline">Cat-Cow Stretch</a> — Spine mobility 🐮</li>
        <li>🧘 <a href="https://www.google.com/search?q=Seated+Forward+Fold+Stretch" target="_blank" class="text-blue-400 hover:underline">Seated Forward Fold</a> — Hamstring & back relief 🌙</li>
        <li>🧵 <a href="https://www.google.com/search?q=Thread+the+Needle+Stretch" target="_blank" class="text-blue-400 hover:underline">Thread the Needle</a> — Shoulders & upper back 🧶</li>
      </ul>
    </section>

  </div>

</body>
    `,
	},
];
