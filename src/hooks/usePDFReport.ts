import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import PDFReportService from '../utils/services/PDFReportService';
import { MedicationUser } from '@types';
import { useLanguage } from '@context/LanguageContext';

export const usePDFReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { translations } = useLanguage();

  const generateMedicationReport = async (
    medications: MedicationUser[],
    patientName: string,
    patientId: string
  ) => {
    if (medications.length === 0) {
      Alert.alert(
        translations.noMedicationsTitle,
        translations.noMedicationsReportMessage
      );
      return;
    }

    setIsGenerating(true);

    try {
      const pdfService = new PDFReportService(translations, {
        includeCharts: true,
        includeMedicationDetails: true,
        includeStatistics: true,
        theme: {
          primaryColor: '#00a69d',
          secondaryColor: '#21aae1',
          accentColor: '#7cced4',
        },
      });

      const result = await pdfService.generatePDF(medications, patientName, patientId);

      if (Platform.OS === 'web') {
        Alert.alert(
          translations.pdfGeneratedTitle,
          translations.pdfGeneratedMessage
        );
      } else {
        Alert.alert(
          translations.pdfGeneratedTitle,
          translations.pdfSavedMessage
        );
      }
    } catch (error) {
      console.error('Error generando reporte PDF:', error);
      Alert.alert(
        translations.errorTitle,
        translations.pdfErrorMessage
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateMedicationReport,
    isGenerating,
  };
};
