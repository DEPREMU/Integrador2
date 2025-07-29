import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  List,
  RadioButton,
} from "react-native-paper";
import { useLanguage } from "@context/LanguageContext";
import { useUserContext } from "@context/UserContext";
import HeaderComponent from "@components/common/Header";
import CardComponent from "@components/Home/Card";

interface PillboxSettingsProps {}

interface Compartment {
  id: number;
  medication: string;
  dosage: string;
}

interface Patient {
  id: string;
  name: string;
  role?: string;
}

const PillboxSettings: React.FC<PillboxSettingsProps> = () => {
  const { isLoggedIn, userData } = useUserContext();
  const { t } = useLanguage();

  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [compartments, setCompartments] = useState<Compartment[]>(
    Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      medication: "",
      dosage: "",
    })),
  );

  // Función para cargar los pacientes del usuario
  const loadPatients = async () => {
    try {
      // Aquí deberías hacer la llamada a tu API para obtener los pacientes
      // Por ahora simulo algunos pacientes de ejemplo
      const mockPatients: Patient[] = [
        { id: "1", name: "Juan Pérez", role: "patient" },
        { id: "2", name: "María García", role: "patient" },
        { id: "3", name: "Carlos López", role: "patient" },
      ];
      setPatients(mockPatients);
    } catch (error) {
      console.error("Error loading patients:", error);
      Alert.alert("Error", "No se pudieron cargar los pacientes");
    }
  };

  useEffect(() => {
    if (isLoggedIn && userData) {
      loadPatients();
    }
  }, [isLoggedIn, userData]);

  const updateCompartment = (
    id: number,
    field: keyof Omit<Compartment, "id">,
    value: string,
  ) => {
    setCompartments((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, [field]: value } : comp)),
    );
  };

  const handleSave = () => {
    if (!selectedPatient) {
      Alert.alert("Error", "Por favor selecciona un paciente");
      return;
    }

    console.log("Paciente seleccionado:", selectedPatient);
    console.log("Compartments saved:", compartments);
    // Aquí puedes agregar la lógica para guardar los datos
  };

  const renderPatientSelector = () => (
    <Card style={styles.patientCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Seleccionar Paciente</Text>
        <Text style={styles.sectionSubtitle}>
          ¿Para qué paciente es este pastillero?
        </Text>

        <View style={styles.patientList}>
          {patients.map((patient) => (
            <View key={patient.id} style={styles.patientItem}>
              <RadioButton
                value={patient.id}
                status={
                  selectedPatient === patient.id ? "checked" : "unchecked"
                }
                onPress={() => setSelectedPatient(patient.id)}
                color="#60c4b4"
              />
              <Text style={styles.patientName}>{patient.name}</Text>
            </View>
          ))}
        </View>

        {patients.length === 0 && (
          <Text style={styles.noPatients}>
            No hay pacientes disponibles. Agrega pacientes primero.
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderCompartmentForm = (compartment: Compartment) => (
    <View key={compartment.id} style={styles.compartmentContainer}>
      <Text style={styles.compartmentTitle}>
        Compartimento {compartment.id}
      </Text>

      <TextInput
        style={styles.input}
        label="Medicamento"
        value={compartment.medication}
        onChangeText={(value) =>
          updateCompartment(compartment.id, "medication", value)
        }
        mode="outlined"
        outlineColor="#ccc"
        activeOutlineColor="#60c4b4"
      />

      <TextInput
        style={styles.input}
        label="Dosis"
        value={compartment.dosage}
        onChangeText={(value) =>
          updateCompartment(compartment.id, "dosage", value)
        }
        mode="outlined"
        outlineColor="#ccc"
        activeOutlineColor="#60c4b4"
        placeholder="ej: 500mg"
      />
    </View>
  );

  return (
    <>
      <HeaderComponent />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <CardComponent title="Capsy" description={t("pillboxDescription")} />

          {renderPatientSelector()}

          <Text style={styles.formTitle}>Configuración del Pastillero</Text>

          {compartments.map(renderCompartmentForm)}

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            buttonColor="#21aae1"
            textColor="#FFFFFF"
          >
            {t("save")}
          </Button>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginVertical: 20,
  },
  compartmentContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compartmentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#60c4b4",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  patientCard: {
    backgroundColor: "#ffffff",
    marginVertical: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  patientList: {
    paddingVertical: 8,
  },
  patientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  patientName: {
    fontSize: 16,
    color: "#222",
    marginLeft: 8,
    flex: 1,
  },
  noPatients: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
});

export default PillboxSettings;
