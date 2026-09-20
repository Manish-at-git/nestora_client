import type { ServiceStatusKey, ServiceTypeKey } from "../constants";

export interface ServiceRequest {
  id: string | number;
  sr_display_id: string;
  service_type: ServiceTypeKey | string;
  sub_category?: string | null;
  custom_title?: string | null;
  description?: string | null;
  image_url?: string | null;
  status: string;
  incoming_call_no?: string | null;
  user_id?: string | number | null;
  association_id?: string | number | null;
  unit_id?: string | number | null;
  unit_number?: string | null;
  block_name?: string | null;
  association_name?: string | null;
  requestor_name?: string | null;
  requestor_phone?: string | null;
  requestor_email?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ServiceRequestMessage {
  id: string | number;
  service_request_id: string | number;
  sender_id: string | number;
  message?: string | null;
  attachment_url?: string | null;
  created_at: string;
  email?: string | null;
  role_id?: string | number | null;
  sender_name?: string | null;
}

export interface CreateServiceRequestPayload {
  service_type: string;
  sub_category?: string;
  custom_title?: string;
  description?: string;
  image_url?: string | null;
  user_id?: string;
  incoming_call_no?: string;
  association_id?: string;
}

export interface UpdateServiceRequestStatusPayload {
  id: string | number;
  status: string;
}

export interface MapServiceRequestPayload {
  id: string | number;
  association_id: string;
  unit_id: string;
  user_id: string;
}

export interface SendServiceRequestMessagePayload {
  requestId: string | number;
  message?: string;
  attachment_url?: string | null;
}

export interface BlockOption {
  id: string | number;
  name: string;
}

export interface UnitOption {
  id: string | number;
  unit_number: string;
  block_name?: string;
}

export interface HomeownerOption {
  user_id: string | number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}
