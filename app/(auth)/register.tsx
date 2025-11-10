import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!displayName || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password, displayName);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.logo}>Framez</Text>
                <Text style={styles.subtitle}>Create your account</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholderTextColor="#999"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#999"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password (min 6 characters)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.linkText}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30
    },
    logo: {
        fontSize: 48,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#E1306C',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 50
    },
    form: {
        width: '100%'
    },
    input: {
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 5,
        padding: 15,
        marginBottom: 12,
        fontSize: 14
    },
    button: {
        backgroundColor: '#E1306C',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10
    },
    buttonDisabled: {
        opacity: 0.6
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30
    },
    footerText: {
        color: '#666',
        fontSize: 14
    },
    linkText: {
        color: '#E1306C',
        fontSize: 14,
        fontWeight: '600'
    }
});