// Clean TypeScript definitions

export type ResponseGetUserMedications = {
  medications: any[];
  [key: string]: any;
};

export type TypeBodyGetUserMedications = {
  userId: string;
  [key: string]: any;
};

export type ResponseGetUserPatients = {
  patients: any[];
  [key: string]: any;
};

export * from "./Database";
export * from "./TypesAPI";
// MedicationUser is already exported from Database, so do not re-export from TypesSchedule to avoid duplicate export error.
