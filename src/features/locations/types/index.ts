export interface LocationCountry {
  id: string;
  name: string;
  iso2_code: string;
}

export interface LocationRegion {
  id: string;
  country_id: string;
  name: string;
  kind: string;
}

export interface LocationCity {
  id: string;
  region_id: string;
  district_id?: string | null;
  name: string;
}
