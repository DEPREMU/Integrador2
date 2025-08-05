export interface MedicationStatistics {
  totalMedications: number;
  activeMedications: number;
  completedMedications: number;
  adherenceRate: number;
  mostFrequentTime: string;
  averageDailyMedications: number;
  medicationsByType: Record<string, number>;
  weeklyAdherence: number[];
}

export interface PatientSummary {
  name: string;
  age?: number;
  id: string;
  totalMedications: number;
  activeTreatments: number;
  lastUpdate: string;
}

export interface MedicationSummary {
  name: string;
  dosage: string;
  frequency: string;
  daysOfWeek: string[];
  timeSlots: string[];
  startDate: string;
  endDate?: string;
  adherencePercentage: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
}

export interface ChartData {
  type: 'bar' | 'pie' | 'line';
  title: string;
  data: {
    labels: string[];
    values: number[];
  };
}

export interface PDFReportData {
  patient: PatientSummary;
  medications: MedicationSummary[];
  statistics: MedicationStatistics;
  charts: ChartData[];
  generatedAt: string;
  reportPeriod: {
    from: string;
    to: string;
  };
}

export interface PDFConfig {
  includeCharts: boolean;
  includeMedicationDetails: boolean;
  includeStatistics: boolean;
  logoPath?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}
