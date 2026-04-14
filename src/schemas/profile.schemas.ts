import { z } from "zod";

export const createProfileSchema = z.object({
  name: z.string().trim().min(1, "name cannot be empty"),
  gender: z.string(),
  gender_probability: z.number(),
  sample_size: z.number(),
  age: z.number(),
  age_group: z.string(),
  country: z.string(),
  country_probability: z.number(),
});

export const profileResponseSchema = createProfileSchema.extend({
  id: z.string(),
  created_at: z.string(),
});

export type CreateProfileDTO = z.infer<typeof createProfileSchema>;
export type ProfileResponseDTO = z.infer<typeof profileResponseSchema>;

export type GenderizeResponse = {
  name: string;
  gender: string | null;
  probability: number;
  count: number;
};

export type AgifyResponse = {
  name: string;
  age: number | null;
  count: number;
};

export type NationalizeCountry = {
  country_id: string;
  probability: number;
};

export type NationalizeResponse = {
  name: string;
  country: NationalizeCountry[];
};
