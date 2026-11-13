export interface MarketCredentials {
	baseUrl: string;
	token: string;
	updatedAt?: string;
}

export interface MarketCredentialsStatus {
	baseUrl: string;
	tokenConfigured: boolean;
	updatedAt?: string;
}
