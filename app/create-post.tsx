import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function CreatePostScreen() {
    const [text, setText] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string): Promise<string> => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `posts/${user?.uid}_${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);

        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    };

    const handlePost = async () => {
        if (!text.trim() && !imageUri) {
            Alert.alert('Error', 'Please add text or an image');
            return;
        }

        setUploading(true);
        try {
            let imageUrl = null;

            if (imageUri) {
                imageUrl = await uploadImage(imageUri);
            }

            await addDoc(collection(db, 'posts'), {
                authorId: user?.uid,
                authorName: user?.displayName || 'Anonymous',
                text: text.trim(),
                imageUrl: imageUrl,
                createdAt: new Date().toISOString()
            });

            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="What's on your mind?"
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={500}
                        placeholderTextColor="#999"
                    />

                    {imageUri && (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: imageUri }} style={styles.image} />
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => setImageUri(null)}
                            >
                                <Ionicons name="close-circle" size={32} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                        <Ionicons name="images-outline" size={24} color="#E1306C" />
                        <Text style={styles.imageButtonText}>
                            {imageUri ? 'Change Image' : 'Add Image'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.postButton, uploading && styles.postButtonDisabled]}
                    onPress={handlePost}
                    disabled={uploading}
                >
                    <Text style={styles.postButtonText}>
                        {uploading ? 'Posting...' : 'Post'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    scrollContent: {
        flexGrow: 1
    },
    content: {
        flex: 1,
        padding: 20
    },
    textInput: {
        fontSize: 16,
        color: '#262626',
        minHeight: 120,
        textAlignVertical: 'top'
    },
    imageContainer: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative'
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#f0f0f0'
    },
    removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 16
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#E1306C',
        borderRadius: 8,
        borderStyle: 'dashed',
        marginTop: 20
    },
    imageButtonText: {
        color: '#E1306C',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 10
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#efefef'
    },
    postButton: {
        backgroundColor: '#E1306C',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center'
    },
    postButtonDisabled: {
        opacity: 0.6
    },
    postButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});