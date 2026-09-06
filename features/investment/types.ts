export type FearAndGreedData = {
	fear_and_greed: {
		score: number;
		rating: string;
		timestamp: string;
		previous_close: number;
		previous_1_week: number;
		previous_1_month: number;
		previous_1_year: number;
	};
	fear_and_greed_historical: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
	market_momentum_sp500: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
	market_momentum_sp125: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
	stock_price_strength: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
	stock_price_breadth: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
	put_call_options: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
	market_volatility_vix: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
	market_volatility_vix_50: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
	junk_bond_demand: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
	safe_haven_demand: {
		timestamp: number;
		score: number;
		rating: string;
		data: Array<{
			x: number;
			y: number;
			rating: string;
		}>;
	};
};

export interface CryptoSentimentItem {
	value: string;
	value_classification: string;
	timestamp: string;
	time_until_update?: string;
}

export interface CryptoFearAndGreedResponse {
	name: string;
	data: CryptoSentimentItem[];
}

export interface MarketRegimeClassification {
	key:
		| "expansion"
		| "speculative_decoupling"
		| "defensive_rotation"
		| "capitulation";
	title: string;
	headline: string;
	diagnosis: string;
	color: {
		border: string;
		topBar: string;
		badgeBg: string;
		badgeText: string;
		badgeBorder: string;
	};
	compositeScore: number;
	divergence: number;
	playbook: {
		favoredSectors: string[];
		elevatedRisks: string[];
		posture: string;
	};
}
