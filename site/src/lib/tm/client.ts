import { z } from "zod";

const schema = z.object({
  TICKETMASTER_API_KEY: z.string(),
});

const env = schema.parse(process.env);

class TicketMasterClient {
  private base_url: URL;
  private apiKey: string;

  constructor(api_key: string) {
    this.base_url = new URL("https://app.ticketmaster.com/discovery/v2");
    this.apiKey = api_key;
  }

  async fetch(path: string, params?: { [key: string]: string }): Promise<any> {
    const url = new URL(path, this.base_url);
    url.searchParams.set("apikey", this.apiKey);
    for (const [key, value] of Object.entries(params ?? {})) {
      url.searchParams.set(key, value);
    }
    const response = await fetch(url);
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await this.fetch(path, params);
    }
    if (!response.ok) {
      throw new Error(`Error fetching ${url}: ${response.statusText}`);
    }
    return await response.json();
  }
}

export default new TicketMasterClient(
  env.TICKETMASTER_API_KEY,
) as TicketMasterClient;
