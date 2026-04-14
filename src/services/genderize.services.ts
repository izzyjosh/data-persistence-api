import logger from "../utils/logger";
import { BadGatewayError } from "../utils/api.errors";
import { AppDataSource } from "../config/datasource";
import { Profile } from "../models/Profile.models";
import {
  profileResponseSchema,
  ProfileResponseDTO,
  GenderizeResponse,
  AgifyResponse,
  NationalizeResponse,
  NationalizeCountry,
} from "../schemas/profile.schemas";

type ClassifyResult = {
  profile: ProfileResponseDTO;
  message?: string;
};

class ProfileService {
  private readonly profileRepository = AppDataSource.getRepository(Profile);
  private readonly genderize = "https://api.genderize.io";
  private readonly agify = "https://api.agify.io";
  private readonly nationalize = "https://api.nationalize.io";

  ageGrouping(age: number): string {
    if (age <= 12) return "child";
    else if (age <= 19) return "teenager";
    else if (age <= 59) return "adult";
    else if (age >= 60) return "senior";
    else return "unknown";
  }

  async classify(name: string): Promise<ClassifyResult> {
    try {
      const profile = await this.profileRepository.findOneBy({ name });
      if (profile) {
        return {
          profile: profileResponseSchema.parse(profile),
          message: "Profile already exists",
        };
      }

      const [genderizeResponse, agifyResponse, nationalizeResponse] =
        await Promise.all([
          fetch(`${this.genderize}?name=${encodeURIComponent(name)}`),
          fetch(`${this.agify}?name=${encodeURIComponent(name)}`),
          fetch(`${this.nationalize}?name=${encodeURIComponent(name)}`),
        ]);

      if (
        !genderizeResponse.ok ||
        !agifyResponse.ok ||
        !nationalizeResponse.ok
      ) {
        throw new BadGatewayError("Failed to fetch data from external APIs");
      }

      const [genderize, agify, nationalize] = await Promise.all([
        genderizeResponse.json() as Promise<GenderizeResponse>,
        agifyResponse.json() as Promise<AgifyResponse>,
        nationalizeResponse.json() as Promise<NationalizeResponse>,
      ]);

      // edge cases
      if (genderize.gender === null || genderize.count === 0) {
        throw new BadGatewayError("Failed to classify gender");
      }
      if (agify.age === null) {
        throw new BadGatewayError("Failed to classify age");
      }
      if (nationalize.country.length === 0) {
        throw new BadGatewayError("Failed to classify country");
      }

      const gender = genderize.gender;
      const age = agify.age;
      const ageGroup = this.ageGrouping(age);
      const contryData = nationalize.country.reduce(
        (max: NationalizeCountry, item: NationalizeCountry) => {
          return item.probability > max.probability ? item : max;
        },
      );

      const newProfile = this.profileRepository.create();
      newProfile.name = genderize.name;
      newProfile.gender = gender;
      newProfile.gender_probability = genderize.probability;
      newProfile.sample_size = genderize.count;
      newProfile.age = age;
      newProfile.age_group = ageGroup;
      newProfile.country = contryData.country_id;
      newProfile.country_probability = contryData.probability;

      await this.profileRepository.save(newProfile);

      return {
        profile: profileResponseSchema.parse(newProfile),
      };
    } catch (error: any) {
      if (error instanceof BadGatewayError) {
        logger.error(`External API error: ${error.message}`);
        throw error;
      }

      logger.error(`Unexpected classify error: ${error.message}`);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
