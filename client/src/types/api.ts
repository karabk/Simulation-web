export interface ApiScenario {
  id: string;
  name: string;
  endpoint: string;
  payloads: string[];
}

export interface HttpRequestModel {
  method: string;
  url: string;
  headers: Record<string, string | string[]>;
  body?: string;
}

export interface HttpResponseModel {
  status: number;
  headers: Record<string, string>;
  body: string;
}
