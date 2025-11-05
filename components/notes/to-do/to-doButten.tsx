import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, DimensionValue } from 'react-native';

// Definisikan tipe props untuk komponen
interface FloatingActionButtonProps {
  onPress: () => void; // Fungsi yang dipanggil saat tombol ditekan
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={onPress}
      activeOpacity={0.7} // Sedikit transparansi saat ditekan
    >
      <View style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

// Objek gaya untuk komponen
const styles = StyleSheet.create({
  fabContainer: {
    // Posisi di kanan bawah layar
    position: 'absolute',
    bottom: 30, // Jarak dari bawah
    right: 30, // Jarak dari kanan
    // Tambahkan shadow/bayangan agar terlihat mengambang (opsional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // Untuk Android shadow
  },
  fab: {
    // Bentuk lingkaran
    width: 60,
    height: 60,
    borderRadius: 30, // Setengah dari width/height untuk membuat lingkaran
    // Warna ungu seperti di screenshot
    backgroundColor: '#9B59B6', // Contoh warna ungu terang/mirip
    // Pusatkan simbol '+'
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: 'white', // Warna teks putih
    fontSize: 30, // Ukuran simbol plus
    lineHeight: 30, // Atur untuk pemusatan yang lebih baik
    paddingBottom: 2, // Penyesuaian kecil
    fontWeight: '300', // Font tipis untuk simbol plus
  },
});

export default FloatingActionButton;