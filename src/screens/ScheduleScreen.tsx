import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  FlatList,
  ListRenderItem,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

// Definición de tipos
interface MedicationSchedule {
  id: string;
  medication: string;
  dose: string;
  days: string[];
  time: string;
  dosageType?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  conditions: string[];
}

type DayOfWeek = "L" | "M" | "X" | "J" | "V" | "S" | "D";

// Componente temporal para la nueva vista
const TemporaryDebugView = () => (
  <View style={styles.debugContainer}>
    <Text style={styles.debugTitle}>Vista Nueva en Desarrollo</Text>
    <Text style={styles.debugSubtitle}>
      Esta es una previsualización temporal
    </Text>

    {/* Aquí puedes desarrollar tu nueva vista */}
    <View style={styles.debugContent}>
      <Text style={styles.debugText}>
        ⚠️ Esta es un área de desarrollo temporal
      </Text>
      <Text style={styles.debugText}>Desarrolla tu nueva vista aquí</Text>
      <Text style={styles.debugText}>
        Reemplaza este contenido con tu componente real
      </Text>
    </View>

    <TouchableOpacity
      style={styles.debugBackButton}
      onPress={() => {}} // La función se implementa en el componente principal
    >
      <Text style={styles.debugBackButtonText}>← Volver a la aplicación</Text>
    </TouchableOpacity>
  </View>
);

const MedicationScheduler: React.FC = () => {
  // Estado para controlar la vista temporal
  const [showDebugView, setShowDebugView] = useState(false);

  // Estados con tipos definidos
  const [medication, setMedication] = useState<string>("");
  const [dose, setDose] = useState<string>("");
  const [dosageType, setDosageType] = useState<string>("pastillas");
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  // Datos de ejemplo con tipos
  const medicationsList: string[] = [
    "Paracetamol",
    "Ibuprofeno",
    "Metformina",
    "Atorvastatina",
    "Omeprazol",
    "Aspirina",
    "Lisinopril",
    "Levotiroxina",
  ];

  const dosageTypes: string[] = ["pastillas", "mg", "unidades"];

  const daysOfWeek: DayOfWeek[] = ["L", "M", "X", "J", "V", "S", "D"];

  const patients: Patient[] = [
    {
      id: "1",
      name: "María Rodríguez",
      age: 72,
      conditions: ["Hipertensión", "Diabetes"],
    },
    {
      id: "2",
      name: "Juan Pérez",
      age: 68,
      conditions: ["Artritis", "Osteoporosis"],
    },
    {
      id: "3",
      name: "Ana García",
      age: 81,
      conditions: ["Alzheimer", "Parkinson"],
    },
  ];

  const [selectedPatient, setSelectedPatient] = useState<Patient>(patients[0]);

  // Función para agregar horario con validación de tipos
  const handleAddSchedule = () => {
    if (medication && dose && selectedDays.length > 0) {
      const newSchedule: MedicationSchedule = {
        id: Math.random().toString(),
        medication,
        dose,
        days: [...selectedDays],
        time: time.toTimeString().slice(0, 5),
        dosageType,
      };

      setSchedules((prev) => [...prev, newSchedule]);
      resetForm();
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setMedication("");
    setDose("");
    setSelectedDays([]);
    setTime(new Date());
    setDosageType("pastillas");
  };

  // Toggle día seleccionado con tipos
  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Manejar cambio de hora con tipos para DateTimePicker
  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  // Renderizar elemento de la lista de horarios
  const renderScheduleItem: ListRenderItem<MedicationSchedule> = ({ item }) => (
    <View style={styles.scheduleItem}>
      <View style={styles.scheduleInfo}>
        <Text style={styles.medName}>{item.medication}</Text>
        <Text style={styles.doseText}>
          {item.dose} {item.dosageType} - {item.time}
        </Text>
      </View>
      <View style={styles.daysIndicator}>
        {daysOfWeek.map((day) => (
          <Text
            key={day}
            style={[
              styles.dayIndicator,
              item.days.includes(day) && styles.activeDayIndicator,
            ]}
          >
            {day}
          </Text>
        ))}
      </View>
      <TouchableOpacity style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  // Mostrar la vista temporal si showDebugView es true
  if (showDebugView) {
    return <TemporaryDebugView />;
  }

  return (
    <View style={styles.container}>
      {/* Botón flotante para acceder a la vista temporal */}
      <TouchableOpacity
        onPress={() => setShowDebugView(true)}
        style={styles.debugButton}
      >
        <Text style={styles.debugButtonText}>DEV</Text>
      </TouchableOpacity>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Medicamentos</Text>

        {/* Selector de paciente */}
        <View style={styles.patientSelector}>
          <Text style={styles.patientLabel}>Paciente:</Text>
          <View style={styles.patientButtons}>
            {patients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={[
                  styles.patientButton,
                  selectedPatient.id === patient.id && styles.selectedPatient,
                ]}
                onPress={() => setSelectedPatient(patient)}
              >
                <Text
                  style={
                    selectedPatient.id === patient.id
                      ? styles.selectedPatientText
                      : styles.patientButtonText
                  }
                >
                  {patient.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.patientInfo}>
          <Text style={styles.patientDetail}>
            Edad: {selectedPatient.age} años
          </Text>
          <Text style={styles.patientDetail}>
            Condiciones: {selectedPatient.conditions.join(", ")}
          </Text>
        </View>
      </View>

      {/* Formulario de asignación */}
      <ScrollView style={styles.formContainer}>
        {/* Selector de medicamento */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medicamento:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.medicationScroll}
          >
            <View style={styles.medicationButtons}>
              {medicationsList.map((med, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.medButton,
                    medication === med && styles.selectedMedButton,
                  ]}
                  onPress={() => setMedication(med)}
                >
                  <Text
                    style={
                      medication === med
                        ? styles.selectedMedText
                        : styles.medButtonText
                    }
                  >
                    {med}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Dosis y tipo */}
        <View style={styles.doseContainer}>
          <View style={styles.doseInputGroup}>
            <Text style={styles.label}>Dosis:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={dose}
              onChangeText={setDose}
              placeholder="Ej: 2"
            />
          </View>

          <View style={styles.dosageTypeGroup}>
            <Text style={styles.label}>Tipo:</Text>
            <View style={styles.dosageButtons}>
              {dosageTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dosageButton,
                    dosageType === type && styles.selectedDosageButton,
                  ]}
                  onPress={() => setDosageType(type)}
                >
                  <Text
                    style={
                      dosageType === type
                        ? styles.selectedDosageText
                        : styles.dosageButtonText
                    }
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Días de la semana */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Días:</Text>
          <View style={styles.daysContainer}>
            {daysOfWeek.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day) && styles.selectedDay,
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text
                  style={
                    selectedDays.includes(day)
                      ? styles.selectedDayText
                      : styles.dayButtonText
                  }
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selector de hora */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hora:</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {time.toTimeString().slice(0, 5)}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Botón Agregar */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddSchedule}>
          <Text style={styles.addButtonText}>+ Agregar Horario</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista de horarios programados */}
      <View style={styles.schedulesContainer}>
        <Text style={styles.sectionTitle}>Horarios Programados</Text>
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No hay horarios programados
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Agrega medicamentos usando el formulario superior
            </Text>
          </View>
        ) : (
          <FlatList
            data={schedules}
            keyExtractor={(item) => item.id}
            renderItem={renderScheduleItem}
            contentContainerStyle={styles.scheduleList}
          />
        )}
      </View>
    </View>
  );
};

// Estilos mejorados
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecebea", // Color de fondo general
    padding: 16,
  },
  header: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#00a69d", // Sombra principal
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#00a69d", // Título principal
    marginBottom: 12,
  },
  patientSelector: {
    marginBottom: 12,
  },
  patientLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#21aae1", // Etiqueta secundaria
    marginBottom: 8,
  },
  patientButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  patientButton: {
    backgroundColor: "#7cced4", // Botón paciente
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectedPatient: {
    backgroundColor: "#00a69d", // Botón paciente seleccionado
  },
  patientButtonText: {
    color: "#00a69d",
    fontWeight: "500",
  },
  selectedPatientText: {
    color: "white",
    fontWeight: "600",
  },
  patientInfo: {
    backgroundColor: "#ecebea", // Fondo info paciente
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  patientDetail: {
    fontSize: 14,
    color: "#21aae1",
    marginBottom: 4,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#00a69d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontWeight: "600",
    marginBottom: 10,
    color: "#00a69d", // Etiquetas de campos
    fontSize: 16,
  },
  medicationScroll: {
    maxHeight: 50,
  },
  medicationButtons: {
    flexDirection: "row",
    gap: 12,
  },
  medButton: {
    backgroundColor: "#ecebea", // Botón medicamento
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  selectedMedButton: {
    backgroundColor: "#00a69d", // Selección medicamento
  },
  medButtonText: {
    color: "#00a69d",
    fontWeight: "500",
  },
  selectedMedText: {
    color: "white",
    fontWeight: "600",
  },
  doseContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  doseInputGroup: {
    flex: 1,
  },
  dosageTypeGroup: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#7cced4", // Borde input
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#ecebea",
  },
  dosageButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  dosageButton: {
    backgroundColor: "#ecebea", // Botón tipo dosis
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  selectedDosageButton: {
    backgroundColor: "#00a69d", // Selección tipo dosis
  },
  dosageButtonText: {
    color: "#00a69d",
    fontSize: 14,
  },
  selectedDosageText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ecebea", // Botón día
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDay: {
    backgroundColor: "#00a69d", // Día seleccionado
  },
  dayButtonText: {
    color: "#21aae1",
    fontWeight: "500",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "700",
  },
  timeButton: {
    borderWidth: 1,
    borderColor: "#7cced4",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#ecebea",
  },
  timeButtonText: {
    fontSize: 16,
    color: "#00a69d",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#00a69d", // Botón agregar
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#00a69d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  schedulesContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flex: 1,
    shadowColor: "#00a69d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#00a69d",
  },
  scheduleList: {
    paddingBottom: 20,
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#7cced4", // Línea separadora
    alignItems: "center",
  },
  scheduleInfo: {
    flex: 1,
    marginRight: 12,
  },
  medName: {
    fontWeight: "600",
    fontSize: 17,
    marginBottom: 6,
    color: "#00a69d",
  },
  doseText: {
    fontSize: 15,
    color: "#21aae1",
  },
  daysIndicator: {
    flexDirection: "row",
    minWidth: 160,
    justifyContent: "space-between",
  },
  dayIndicator: {
    fontSize: 15,
    color: "#60c4b4", // Días no activos
    fontWeight: "600",
  },
  activeDayIndicator: {
    color: "#00a69d", // Día activo
  },
  deleteButton: {
    backgroundColor: "#fce8e6",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#d93025",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#60c4b4",
    fontWeight: "500",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#21aae1",
    textAlign: "center",
  },

  // Nuevos estilos para la vista temporal
  debugContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  debugTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00a69d",
    marginBottom: 10,
    textAlign: "center",
  },
  debugSubtitle: {
    fontSize: 18,
    color: "#21aae1",
    marginBottom: 30,
    textAlign: "center",
  },
  debugContent: {
    backgroundColor: "#f0f9f8",
    padding: 30,
    borderRadius: 15,
    marginBottom: 30,
    width: "90%",
    alignItems: "center",
  },
  debugText: {
    fontSize: 16,
    color: "#00a69d",
    marginBottom: 15,
    textAlign: "center",
  },
  debugBackButton: {
    backgroundColor: "#00a69d",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
  },
  debugBackButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Estilos para el botón de desarrollo
  debugButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 100,
    backgroundColor: "#d93025",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  debugButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default MedicationScheduler;
