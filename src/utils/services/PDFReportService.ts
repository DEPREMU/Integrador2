import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Platform } from 'react-native';
import { PDFReportData, PDFConfig, MedicationStatistics } from '../../types/PDFReport';
import { MedicationUser } from '@typesAPI';
import { typeLanguages } from '../translates/typesTranslations';

class PDFReportService {
  private config: PDFConfig = {
    includeCharts: true,
    includeMedicationDetails: true,
    includeStatistics: true,
    theme: {
      primaryColor: '#00a69d',
      secondaryColor: '#21aae1',
      accentColor: '#ecebea',
    },
  };

  private translations: typeLanguages;

  constructor(translations: typeLanguages, config?: Partial<PDFConfig>) {
    this.translations = translations;
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  private translateDays(days: string[]): string {
    if (!days || days.length === 0) return this.translations.pdfNotSpecifiedDays;
    
    const dayTranslations: Record<string, string> = {
      'Lunes': this.translations.monday,
      'Martes': this.translations.tuesday,
      'Miércoles': this.translations.wednesday,
      'Jueves': this.translations.thursday,
      'Viernes': this.translations.friday,
      'Sábado': this.translations.saturday,
      'Domingo': this.translations.sunday,
      'Monday': this.translations.monday,
      'Tuesday': this.translations.tuesday,
      'Wednesday': this.translations.wednesday,
      'Thursday': this.translations.thursday,
      'Friday': this.translations.friday,
      'Saturday': this.translations.saturday,
      'Sunday': this.translations.sunday,
    };
    
    return days.map(day => dayTranslations[day] || day).join(', ');
  }

  private formatFrequency(intervalHours: number): string {
    if (this.translations.pdfScheduleLabel === 'Schedule') {
      return `Every ${intervalHours} hours`;
    } else {
      return `Cada ${intervalHours} horas`;
    }
  }

  generateStatistics(medications: MedicationUser[]): MedicationStatistics {
    const now = new Date();
    const activeMedications = medications.filter(med => {
      return true;
    });

    const medicationsByType = medications.reduce((acc, med) => {
      const type = 'medication';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalMedications: medications.length,
      activeMedications: activeMedications.length,
      completedMedications: medications.length - activeMedications.length,
      adherenceRate: 0,
      mostFrequentTime: this.getMostFrequentTime(medications),
      averageDailyMedications: this.calculateAverageDailyMedications(medications),
      medicationsByType,
      weeklyAdherence: [],
    };
  }

  private getMostFrequentTime(medications: MedicationUser[]): string {
    const timeFrequency: Record<string, number> = {};
    
    medications.forEach(med => {
      if (med.startHour) {
        const hour = med.startHour.split(':')[0];
        const period = parseInt(hour) < 12 ? this.translations.morning : 
                      parseInt(hour) < 18 ? this.translations.afternoon : this.translations.night;
        timeFrequency[period] = (timeFrequency[period] || 0) + 1;
      }
    });

    return Object.entries(timeFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || this.translations.morning;
  }

  private calculateAverageDailyMedications(medications: MedicationUser[]): number {
    if (medications.length === 0) return 0;
    
    const totalDailyDoses = medications.reduce((total, med) => {
      const daysCount = med.days ? med.days.length : 1;
      return total + (daysCount > 0 ? 1 : 0);
    }, 0);

    return Math.round((totalDailyDoses / 7) * 10) / 10;
  }

  private async generateHTMLTemplate(data: PDFReportData, originalMedications: MedicationUser[]): Promise<string> {
    const { patient, medications, statistics } = data;
    const currentDate = new Date().toLocaleDateString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #333;
            line-height: 1.4;
          }
          .container {
            width: 100%;
            margin: 0;
            background: white;
            padding: 0;
          }
          .header {
            background: white;
            border: 2px solid ${this.config.theme.primaryColor};
            color: #333;
            padding: 15px;
            text-align: center;
            margin: 0 0 10px 0;
            border-radius: 6px;
          }
          .logo-container {
            margin-bottom: 20px;
          }
          .logo {
            width: 50px;
            height: 50px;
            margin: 0 auto 15px;
            background: ${this.config.theme.primaryColor};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
          }
          .app-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            color: ${this.config.theme.primaryColor};
            letter-spacing: 1px;
          }
          .title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
          }
          .section {
            background: white;
            padding: 10px;
            margin: 0 0 8px 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            border-left: 4px solid ${this.config.theme.primaryColor};
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: ${this.config.theme.primaryColor};
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
          }
          .patient-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 8px;
            margin-bottom: 10px;
          }
          .info-card {
            background: white;
            padding: 8px;
            border: 1px solid #eee;
            border-radius: 4px;
            text-align: center;
          }
          .info-label {
            font-size: 11px;
            color: ${this.config.theme.primaryColor};
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
          }
          .info-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 8px;
            margin-bottom: 15px;
          }
          .stat-card {
            background: white;
            padding: 12px 8px;
            border: 1px solid #eee;
            border-radius: 4px;
            text-align: center;
          }
          .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: ${this.config.theme.primaryColor};
            margin-bottom: 6px;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .medication-list {
            margin-top: 20px;
          }
          .medication-item {
            background: white;
            padding: 8px;
            margin: 0 0 6px 0;
            border: 1px solid #eee;
            border-radius: 4px;
            border-left: 4px solid ${this.config.theme.primaryColor};
          }
          .medication-name {
            font-size: 16px;
            font-weight: bold;
            color: ${this.config.theme.primaryColor};
            margin-bottom: 10px;
          }
          .medication-details {
            font-size: 13px;
            color: #666;
            line-height: 1.5;
          }
          .footer {
            text-align: center;
            padding: 8px 0;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #eee;
            margin: 10px 0 0 0;
          }
          .footer p {
            margin: 3px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-container">
              <div class="app-name">MediTime</div>
            </div>
            <div class="title">${this.translations.pdfMedicalReportTitle}</div>
            <div class="subtitle">${this.translations.pdfGeneratedOn} ${currentDate}</div>
          </div>

          <div class="section">
            <div class="section-title"><span style="color: ${this.config.theme.primaryColor};">👨‍⚕️</span> ${this.translations.pdfPatientInformation}</div>
            <div class="patient-info">
              <div class="info-card">
                <div class="info-label"><span style="color: ${this.config.theme.primaryColor};">👤</span> ${this.translations.pdfPatientLabel}</div>
                <div class="info-value">${patient.name}</div>
              </div>
              <div class="info-card">
                <div class="info-label"><span style="color: ${this.config.theme.primaryColor};">💊</span> ${this.translations.pdfTotalMedicationsLabel}</div>
                <div class="info-value">${patient.totalMedications}</div>
              </div>
              <div class="info-card">
                <div class="info-label"><span style="color: ${this.config.theme.primaryColor};">✅</span> ${this.translations.pdfActiveTreatmentsLabel}</div>
                <div class="info-value">${patient.activeTreatments}</div>
              </div>
              <div class="info-card">
                <div class="info-label"><span style="color: ${this.config.theme.primaryColor};">📅</span> ${this.translations.pdfLastUpdateLabel}</div>
                <div class="info-value">${patient.lastUpdate}</div>
              </div>
            </div>
          </div>

        <div class="section">
          <div class="section-title"><span style="color: ${this.config.theme.primaryColor};">📈</span> ${this.translations.pdfGeneralStatistics}</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${statistics.totalMedications}</div>
              <div class="stat-label"><span style="color: ${this.config.theme.primaryColor};">💊</span> ${this.translations.pdfTotalMedicationsLabel}</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${statistics.activeMedications}</div>
              <div class="stat-label"><span style="color: ${this.config.theme.primaryColor};">✅</span> ${this.translations.pdfActiveMedications}</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${statistics.averageDailyMedications}</div>
              <div class="stat-label"><span style="color: ${this.config.theme.primaryColor};">📊</span> ${this.translations.pdfDailyAverage}</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${statistics.mostFrequentTime}</div>
              <div class="stat-label"><span style="color: ${this.config.theme.primaryColor};">⏰</span> ${this.translations.pdfPreferredTime}</div>
            </div>
          </div>
        </div>

        ${this.config.includeMedicationDetails ? this.generateMedicationDetailsHTML(originalMedications) : ''}

          <div class="footer">
            <p>${this.translations.pdfFooterText1}</p>
            <p>${this.translations.pdfFooterText2}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateMedicationDetailsHTML(medications: MedicationUser[]): string {
    if (medications.length === 0) {
      return `
        <div class="section">
          <div class="section-title"><span style="color: ${this.config.theme.primaryColor};">💊</span> ${this.translations.pdfMedicationDetails}</div>
          <p style="text-align: center; color: #666; font-style: italic;"><span style="color: ${this.config.theme.primaryColor};">📋</span> ${this.translations.pdfNoMedicationsRegistered}</p>
        </div>
      `;
    }

    const medicationItems = medications.map(med => {
      let dosageInfo = med.dosage || this.translations.pdfNotSpecified;
      if (med.grams && med.grams > 0) {
        dosageInfo = dosageInfo === this.translations.pdfNotSpecified 
          ? `${med.grams}g` 
          : `${dosageInfo} (${med.grams}g)`;
      }
      
      return `
        <div class="medication-item">
          <div class="medication-name"><span style="color: ${this.config.theme.primaryColor};">💊</span> ${med.name || this.translations.pdfMedicationDefault}</div>
          <div class="medication-details">
            <strong><span style="color: ${this.config.theme.primaryColor};">⚪</span> ${this.translations.pdfDosageLabel}:</strong> ${dosageInfo}<br>
            <strong><span style="color: ${this.config.theme.primaryColor};">⏰</span> ${this.translations.pdfScheduleLabel}:</strong> ${med.startHour || this.translations.pdfNotSpecified}<br>
            <strong><span style="color: ${this.config.theme.primaryColor};">📅</span> ${this.translations.pdfDaysLabel}:</strong> ${this.translateDays(med.days)}<br>
            <strong><span style="color: ${this.config.theme.primaryColor};">🔄</span> ${this.translations.intervalHours}:</strong> ${this.formatFrequency(med.intervalHours || 0)}<br>
            <strong><span style="color: ${this.config.theme.primaryColor};">⚖️</span> Grams:</strong> ${med.grams || 0}g<br>
            <strong><span style="color: ${this.config.theme.primaryColor};">📦</span> ${this.translations.stock}:</strong> ${med.stock || 0}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="section">
        <div class="section-title"><span style="color: ${this.config.theme.primaryColor};">💊</span> ${this.translations.pdfMedicationDetails}</div>
        <div class="medication-list">
          ${medicationItems}
        </div>
      </div>
    `;
  }

  private async generateWebPDF(data: PDFReportData, originalMedications: MedicationUser[]): Promise<void> {
    const html = await this.generateHTMLTemplate(data, originalMedications);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm';
    tempDiv.style.margin = '0';
    tempDiv.style.padding = '0';
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      while (heightLeft >= 0) {
        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        if (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
        } else {
          break;
        }
      }

      const fileName = `reporte-medicamentos-${data.patient.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  private async generateNativePDF(data: PDFReportData, originalMedications: MedicationUser[]): Promise<string> {
    if (Platform.OS === 'web') {
      throw new Error('Este método es solo para React Native');
    }

    try {
      const RNPrint = require('react-native-print');
      
      const html = await this.generateHTMLTemplate(data, originalMedications);
      
      const options = {
        html,
        fileName: `reporte-medicamentos-${Date.now()}`,
        width: 612,
        height: 792,
        padding: 0,
        bgColor: '#FFFFFF',
      };

      const result = await RNPrint.print(options);
      return result.filePath || 'PDF generated successfully';
    } catch (error) {
      console.warn('react-native-print not available, PDF generation not supported on this platform');
      return 'PDF generation not available on this platform';
    }
  }

  async generatePDF(
    medications: MedicationUser[], 
    patientName: string,
    patientId: string
  ): Promise<string | void> {
    try {
      const statistics = this.generateStatistics(medications);
      
      const reportData: PDFReportData = {
        patient: {
          name: patientName,
          id: patientId,
          totalMedications: medications.length,
          activeTreatments: statistics.activeMedications,
          lastUpdate: new Date().toLocaleDateString(),
        },
        medications: medications.map(med => ({
          name: med.name || this.translations.pdfMedicationDefault,
          dosage: med.dosage || '0',
          frequency: med.intervalHours ? 
            this.formatFrequency(med.intervalHours) : 
            this.translations.pdfNotSpecified,
          daysOfWeek: med.days || [],
          timeSlots: med.startHour ? [med.startHour] : [],
          startDate: new Date().toLocaleDateString(),
          adherencePercentage: Math.floor(Math.random() * 20) + 80,
          totalDoses: Math.floor(Math.random() * 50) + 10,
          takenDoses: Math.floor(Math.random() * 40) + 8,
          missedDoses: Math.floor(Math.random() * 5),
        })),
        statistics,
        charts: [],
        generatedAt: new Date().toISOString(),
        reportPeriod: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
          to: new Date().toLocaleDateString('es-ES'),
        },
      };

      if (Platform.OS === 'web') {
        await this.generateWebPDF(reportData, medications);
        return;
      } else {
        return await this.generateNativePDF(reportData, medications);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }

  private async getLogoBase64(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch('/assets/icon.png');
        if (!response.ok) {
          console.warn('No se pudo cargar el logo desde /assets/icon.png');
          return '';
        }
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = () => {
            console.error('Error reading logo file');
            resolve('');
          };
          reader.readAsDataURL(blob);
        });
      } else {
        try {
          const Asset = require('expo-asset').Asset;
          const asset = Asset.fromModule(require('../../../assets/icon.png'));
          await asset.downloadAsync();
          
          return '';
        } catch (error) {
          console.error('Error loading React Native asset:', error);
          return '';
        }
      }
    } catch (error) {
      console.error('Error loading logo:', error);
      return '';
    }
  }
}

export default PDFReportService;
