"use client";

import { useEffect } from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
);

interface FearAndGreedChartWrapperProps {
	data: any;
	options: any;
}

export default function FearAndGreedChartWrapper({
	data,
	options,
}: FearAndGreedChartWrapperProps) {
	return <Line data={data} options={options} />;
}
