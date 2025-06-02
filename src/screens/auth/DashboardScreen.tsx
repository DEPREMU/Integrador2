import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PatientCard from '@components/PatientCard';
import ButtonComponent from '@components/Button';
import ModalComponent from '@components/ModalComponent';
import { useModal } from '@context/ModalContext';
import { useWindowDimensions } from 'react-native';
import { RootStackParamList } from '@navigation/navigationTypes';
import { ADD_ICON } from '@/utils';

const patients = [
    { id: '1', name: 'Juan Pérez', photo: 'https://via.placeholder.com/80', pills: ['A', 'B', 'C'] },
    { id: '2', name: 'María López', photo: 'https://via.placeholder.com/80', pills: ['D', 'E', 'F'] },
    { id: '3', name: 'Carlos Ruiz', photo: 'https://via.placeholder.com/80', pills: ['G', 'H', 'I'] },
    { id: '4', name: 'Ana Gómez', photo: 'https://via.placeholder.com/80', pills: ['J', 'K', 'L'] },
    { id: '5', name: 'Luis Díaz', photo: 'https://via.placeholder.com/80', pills: ['M', 'N', 'O'] },
];

type DashboardNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function DashboardScreen() {
    const navigation = useNavigation<DashboardNavProp>();
    const { isOpen, openModal, closeModal } = useModal();
    const [hideModal, setHideModal] = useState(true);
    const { width: screenWidth } = useWindowDimensions();
    const cardWidth = screenWidth * 0.3;

    useEffect(() => {
        if (isOpen) setHideModal(false);
    }, [isOpen]);

    const data = [...patients, { id: 'add' }];

    return (
        <View style={styles.container}>
            <View style={styles.headerPlaceholder}>
                <Text style={styles.headerText}>[aquí irá el Header]</Text>
            </View>
            <Text style={styles.greeting}>Hola, Admin Usuario</Text>
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) =>
                    item.id === 'add' ? (
                        <View style={[styles.addCard, { width: cardWidth }]}>
                            <ButtonComponent
                                label="+"
                                handlePress={() =>
                                    openModal(
                                        "Agregar paciente",
                                        <Text>Aquí tu formulario o placeholders</Text>,
                                        <ButtonComponent label="Cerrar" handlePress={closeModal} />
                                    )
                                }
                                customStyles={{ button: styles.addButton, textButton: styles.addText }}
                            />
                        </View>
                    ) : (
                        <PatientCard
                            name={item.name}
                            photoUrl={item.photo}
                            pills={item.pills}
                            onPress={() => navigation.replace('Login')}
                            style={{ width: cardWidth }}
                        />
                    )
                }
            />

            <ModalComponent
                title="Agregar paciente"
                body={<Text>Aquí tu formulario o placeholders</Text>}
                buttons={<ButtonComponent label="Cerrar" handlePress={closeModal} />}
                isOpen={isOpen}
                onClose={closeModal}
                hideModal={hideModal}
                setHideModal={setHideModal}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ecebea' },
    headerPlaceholder: { height: 60, backgroundColor: '#00a69d', justifyContent: 'center', alignItems: 'center' },
    headerText: { color: '#fff' },
    greeting: { fontSize: 20, fontWeight: '600', margin: 16 },
    listContent: { alignItems: 'center', paddingHorizontal: 20 },
    addCard: { height: 260, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    addButton: { height: 60, width: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#21aae1' },
    addText: { fontSize: 32, color: '#fff' },
}); 