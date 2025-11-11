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
import { useSupabase } from '@/config/useSupabase';
import { useAuth } from '../contexts/AuthContext';
import { decode } from 'base64-arraybuffer';

export default function CreatePostScreen() {
    const supabase = useSupabase();
    const [text, setText] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const displayName = user?.user_metadata?.display_name || 'Anonymous';

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
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const fileName = `${user?.id}_${Date.now()}.jpg`;
        const filePath = `posts/${fileName}`;

        // Handle web platform differently
        if (Platform.OS === 'web') {
            // Fetch the blob from the URI
            const response = await fetch(uri);
            const blob = await response.blob();

            const { data, error } = await supabase.storage
                .from('post-images')
                .upload(filePath, blob, {
                    contentType: 'image/jpeg',
                });

            if (error) {
                console.error('Upload error:', error);
                throw error;
            }
        } else {
            // For native platforms, use the legacy API
            const { readAsStringAsync } = require('expo-file-system/legacy');

            const base64 = await readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const { data, error } = await supabase.storage
                .from('post-images')
                .upload(filePath, decode(base64), {
                    contentType: 'image/jpeg',
                });

            if (error) {
                console.error('Upload error:', error);
                throw error;
            }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(filePath);

        console.log('Image uploaded, public URL:', publicUrl);
        return publicUrl;
    };

    const handlePost = async () => {
        if (!text.trim() && !imageUri) {
            Alert.alert('Error', 'Please add text or an image');
            return;
        }

        if (!supabase) {
            Alert.alert('Error', 'App not ready. Please try again.');
            return;
        }

        setUploading(true);
        try {
            let imageUrl = null;

            if (imageUri) {
                console.log('Uploading image...');
                imageUrl = await uploadImage(imageUri);
                console.log('Image URL:', imageUrl);
            }

            const postData = {
                author_id: user?.id,
                author_name: displayName,
                text: text.trim(),
                image_url: imageUrl,
                created_at: new Date().toISOString(),
            };

            console.log('Inserting post:', postData);

            const { data, error } = await supabase.from('posts').insert([postData]).select();

            if (error) {
                console.error('Insert error:', error);
                throw error;
            }

            console.log('Post created successfully:', data);
            Alert.alert('Success', 'Post created!');
            router.back();
        } catch (error: any) {
            console.error('Error creating post:', error);
            Alert.alert('Error', error.message || 'Failed to create post');
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