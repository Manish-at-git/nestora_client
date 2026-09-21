import baseApi from "@/services/api/baseApi";
import { unwrapApiList } from "@/services/api/response";
import type { LocationCity, LocationCountry, LocationRegion } from "../types";

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocationCountries: builder.query<LocationCountry[], void>({
      query: () => ({ url: "/locations/countries", method: "GET" }),
      transformResponse: (response: unknown) => unwrapApiList<LocationCountry>(response),
      providesTags: ["Locations"],
    }),
    getLocationRegions: builder.query<LocationRegion[], string>({
      query: (countryId) => ({ url: "/locations/regions", method: "GET", params: { country_id: countryId } }),
      transformResponse: (response: unknown) => unwrapApiList<LocationRegion>(response),
      providesTags: ["Locations"],
    }),
    getLocationCities: builder.query<LocationCity[], string>({
      query: (regionId) => ({ url: "/locations/cities", method: "GET", params: { region_id: regionId } }),
      transformResponse: (response: unknown) => unwrapApiList<LocationCity>(response),
      providesTags: ["Locations"],
    }),
  }),
});

export const {
  useGetLocationCountriesQuery,
  useGetLocationRegionsQuery,
  useGetLocationCitiesQuery,
} = locationsApi;
