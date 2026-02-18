export interface Market {
  id: string;
  question: string;
  slug: string;
  outcomePrices: string[]; // ["0.99", "0.01"]
  volume: string | number;
  liquidity: string | number;
  topicId?: string | number;
  image?: string;
  icon?: string;
  description?: string;
  tags?: Array<{ id: string; label: string; slug: string }>;
  active: boolean;
  closed: boolean;
  endDate?: string;
}

export interface OpinionEvent {
  id: string;
  title: string;
  slug: string;
  topicId?: string | number;
  image?: string;
  icon?: string;
  description?: string;
  tags?: Array<{ id: string; label: string; slug: string }>;
  markets: Market[];
  volume: string | number;
  liquidity: string | number;
  active: boolean;
  closed: boolean;
}

export interface FetchParams {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  closed?: boolean;
  active?: boolean;
}
