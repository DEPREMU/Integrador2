import React, { useState, useEffect, } from 'react';
import { View, Text, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ModalComponent from '@components/ModalComponent';
import { useModal } from '@context/ModalContext';
import { RootStackParamList } from '@navigation/navigationTypes';
import stylesDashboardScreen from '@styles/screens/stylesDashboardScreen';
import HeaderComponent from "@components/Header";
import { useLanguage } from "@/context/LanguageContext";
import ButtonComponent from '@components/Button';
import PatientCarousel, { Patient } from '@components/PatientCarousel';


/**
 * DashboardScreen component displays a horizontal list of patients and an add-patient button.
 * It manages modal visibility for adding new patients and handles navigation.
 *
 * @component
 * @returns {JSX.Element} The Dashboard screen UI.
 */
export default function DashboardScreen() {
    const navigation = useNavigation<DashboardNavProp>();
    const { isOpen, openModal, closeModal } = useModal();
    const [hideModal, setHideModal] = useState(true);
    const { stylesDashboardScreen: styles } = stylesDashboardScreen();
    const { translations } = useLanguage();


    useEffect(() => {
        if (isOpen) setHideModal(false);
    }, [isOpen]);

    return (
        <View style={styles.container}>
            <HeaderComponent />
            <Text style={styles.greeting}>{translations.greeting}</Text>
            <View style={styles.userImagePlaceholder}>
                {/* 
        */}
            </View>
            <PatientCarousel
                data={data}
                styles={styles}
                translations={{
                    AddPatient: translations.AddPatient,
                    AddPatientForm: translations.AddPatientForm,
                    CloseModal: translations.CloseModal,
                }}
                openModal={openModal}
                closeModal={closeModal}
            />

            < ModalComponent
                title={translations.AddPatient}
                body={< Text > {translations.AddPatientForm}</Text >}
                buttons={
                    <ButtonComponent
                        label={translations.CloseModal}
                        handlePress={closeModal}
                    />
                }

                isOpen={isOpen}
                onClose={closeModal}
                hideModal={hideModal}
                setHideModal={setHideModal}
            />

        </View >
    );
}

const data: Patient[] = [
    { id: '1', name: 'Juan Pérez', photo: 'https://via.placeholder.com/80', pills: ['A', 'B', 'C'] },
    { id: '2', name: 'María López', photo: 'https://via.placeholder.com/80', pills: ['D', 'E', 'F'] },
    { id: '3', name: 'Carlos Ruiz', photo: 'https://via.placeholder.com/80', pills: ['G', 'H', 'I'] },
    { id: '4', name: 'Ana Gómez', photo: 'https://via.placeholder.com/80', pills: ['J', 'K', 'L'] },
    { id: '5', name: 'Luis Díaz', photo: 'https://via.placeholder.com/80', pills: ['M', 'N', 'O'] },
    { id: 'add', name: '', photo: '', pills: [] },
];

type DashboardNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;