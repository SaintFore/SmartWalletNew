import createClient from "openapi-fetch";
import type { paths } from "./types.ts";

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
});
