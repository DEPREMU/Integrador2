import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/navigationTypes';
import stylesDashboardScreen from '@styles/screens/stylesDashboardScreen';
import HeaderComponent from "@components/Header";
import { useLanguage } from "@/context/LanguageContext";
import { useModal } from '@context/ModalContext';
import PatientCarousel, { Patient } from '@components/PatientCarousel';

type DashboardNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/**
 * DashboardScreen component displays the main dashboard UI, including:
 * - A header
 * - A greeting message (localized)
 * - A placeholder for the user image
 * - A horizontal carousel of patient cards and an add-patient button
 * 
 * It uses context for language translations and modal management.
 *
 * @component
 * @returns {JSX.Element} The rendered dashboard screen.
 *
 * @example
 * <DashboardScreen />
 */
const DashboardScreen = () => {
    const navigation = useNavigation<DashboardNavProp>();
    const { stylesDashboardScreen: styles } = stylesDashboardScreen();
    const { translations } = useLanguage();
    const { openModal, closeModal } = useModal();

    return (
        <View style={styles.container}>
            <HeaderComponent />
            <Text style={styles.greeting}>{translations.greeting}</Text>
            <View style={styles.userImagePlaceholder} />
            <PatientCarousel
                data={data}
                styles={styles}
                translations={{
                    addPatient: translations.addPatient,
                    addPatientForm: translations.addPatientForm,
                    close: translations.close,
                }}
                openModal={openModal}
                closeModal={closeModal}
            />
        </View>
    );
};

export default DashboardScreen;

const data: Patient[] = [
    { id: '1', name: 'Juan Pérez', photo: 'https://via.placeholder.com/80', pills: ['A', 'B', 'C'] },
    { id: '2', name: 'María López', photo: 'https://via.placeholder.com/80', pills: ['D', 'E', 'F'] },
    { id: '3', name: 'Carlos Ruiz', photo: 'https://via.placeholder.com/80', pills: ['G', 'H', 'I'] },
    { id: '4', name: 'Ana Gómez', photo: 'https://via.placeholder.com/80', pills: ['J', 'K', 'L'] },
    { id: '5', name: 'Luis Díaz', photo: 'https://via.placeholder.com/80', pills: ['M', 'N', 'O'] },
    { id: 'add', name: '', photo: '', pills: [] },
];

