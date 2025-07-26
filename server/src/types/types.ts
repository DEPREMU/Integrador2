// Archivo de tipos principal para importaciones sin conflictos
export * from './Database';
export * from './TypesAPI';
// MedicationUser ya está exportado desde Database, no se reexporta desde TypesSchedule para evitar duplicidad
export type {
  TypeBodyCreatePatient,
  ResponseCreatePatient,
  TypeBodyDeletePatient,
  ResponseDeletePatient,
  TypeBodyAddExistingPatient,
  ResponseAddExistingPatient
} from './TypesAPI';
