import logger from "../utils/logger";
import { BadGatewayError, NotFoundError } from "../utils/api.errors";
import { AppDataSource } from "../config/datasource";
import { Profile } from "../models/Profile.models";
import {
  profileResponseSchema,
  ProfileResponseDTO,
  GenderizeResponse,
  AgifyResponse,
  NationalizeResponse,
  NationalizeCountry,
  ListProfileDTO,
  listProfileSchema,
} from "../schemas/profile.schemas";
import { StatusCodes } from "http-status-codes";
import { cacheService } from "./cache.service";
import { cache } from "../utils/cacheDecorator";

type ClassifyResult = {
  profile: ProfileResponseDTO;
  message?: string;
  statusCode: number;
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

  private throwUpstreamError(
    apiName: "Genderize" | "Agify" | "Nationalize",
  ): never {
    throw new BadGatewayError(`${apiName} returned an invalid response`, "502");
  }

  private ensureOkResponse(
    response: Response,
    apiName: "Genderize" | "Agify" | "Nationalize",
  ): Response {
    if (!response.ok) {
      this.throwUpstreamError(apiName);
    }
    return response;
  }

  @cache({ ttl: 360, key: (name: string) => `classify:${name.toLowerCase()}` })
  async classify(name: string): Promise<ClassifyResult> {
    try {
      const profile = await this.profileRepository.findOneBy({ name });
      if (profile) {
        return {
          profile: profileResponseSchema.parse(profile),
          message: "Profile already exists",
          statusCode: StatusCodes.OK,
        };
      }

      const [genderizeFetch, agifyFetch, nationalizeFetch] =
        await Promise.allSettled([
          fetch(`${this.genderize}?name=${encodeURIComponent(name)}`),
          fetch(`${this.agify}?name=${encodeURIComponent(name)}`),
          fetch(`${this.nationalize}?name=${encodeURIComponent(name)}`),
        ]);

      if (genderizeFetch.status === "rejected") {
        this.throwUpstreamError("Genderize");
      }
      if (agifyFetch.status === "rejected") {
        this.throwUpstreamError("Agify");
      }
      if (nationalizeFetch.status === "rejected") {
        this.throwUpstreamError("Nationalize");
      }

      const genderizeResponse = this.ensureOkResponse(
        genderizeFetch.value,
        "Genderize",
      );
      const agifyResponse = this.ensureOkResponse(agifyFetch.value, "Agify");
      const nationalizeResponse = this.ensureOkResponse(
        nationalizeFetch.value,
        "Nationalize",
      );

      const [genderize, agify, nationalize] = await Promise.all([
        genderizeResponse.json() as Promise<GenderizeResponse>,
        agifyResponse.json() as Promise<AgifyResponse>,
        nationalizeResponse.json() as Promise<NationalizeResponse>,
      ]);

      // edge cases
      if (genderize.gender === null || genderize.count === 0) {
        this.throwUpstreamError("Genderize");
      }
      if (agify.age === null) {
        this.throwUpstreamError("Agify");
      }
      if (nationalize.country.length === 0) {
        this.throwUpstreamError("Nationalize");
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
      newProfile.country_id = contryData.country_id;
      newProfile.country_probability = contryData.probability;

      await this.profileRepository.save(newProfile);

      return {
        profile: profileResponseSchema.parse(newProfile),
        statusCode: StatusCodes.CREATED,
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

  @cache({ ttl: 3600, key: (id: string) => `profile:${id}` })
  async getProfile(id: string) {
    const profile = await this.profileRepository.findOneBy({ id });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    return profileResponseSchema.parse(profile);
  }

  @cache({ ttl: 180, key: () => "profiles:list" })
  async getAllProfiles(filters?: {
    gender?: string;
    country_id?: string;
    age_group?: string;
  }) {
    const queryBuilder = this.profileRepository.createQueryBuilder("profile");

    if (filters?.gender) {
      queryBuilder.andWhere("LOWER(profile.gender) = LOWER(:gender)", {
        gender: filters.gender,
      });
    }

    if (filters?.country_id) {
      queryBuilder.andWhere("LOWER(profile.country_id) = LOWER(:country_id)", {
        country_id: filters.country_id,
      });
    }

    if (filters?.age_group) {
      queryBuilder.andWhere("LOWER(profile.age_group) = LOWER(:age_group)", {
        age_group: filters.age_group,
      });
    }

    const profiles = await queryBuilder.getMany();
    const profilesMap: ListProfileDTO[] = profiles.map((profile: Profile) =>
      listProfileSchema.parse(profile),
    );
    const count = profilesMap.length;
    return { profiles: profilesMap, count };
  }

  async deleteProfile(id: string) {
    const profile = await this.profileRepository.findOneBy({ id });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // invaldate cache for this profile and the list endpoint
    await cacheService.del(`profile:${id}`);
    await cacheService.del("profiles:list");

    await this.profileRepository.remove(profile);
  }
}

export const profileService = new ProfileService();
