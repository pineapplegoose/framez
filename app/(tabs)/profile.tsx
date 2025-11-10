import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/PostCard';

interface Post {
    id: string;
    authorName: string;
    authorId: string;
    text: string;
    imageUrl?: string;
    timestamp: string;
}

export default function ProfileScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const { user, logout } = useAuth();

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'posts'),
            where('authorId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData: Post[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                postsData.push({
                    id: doc.id,
                    authorName: data.authorName,
                    authorId: data.authorId,
                    text: data.text || '',
                    imageUrl: data.imageUrl,
                    timestamp: data.createdAt
                });
            });
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, [user]);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.profileSection}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <Text style={styles.name}>{user?.displayName || 'User'}</Text>
                            <Text style={styles.email}>{user?.email}</Text>

                            <View style={styles.statsContainer}>
                                <View style={styles.stat}>
                                    <Text style={styles.statNumber}>{posts.length}</Text>
                                    <Text style={styles.statLabel}>Posts</Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Ionicons name="log-out-outline" size={20} color="#E1306C" />
                                <Text style={styles.logoutText}>Logout</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.postsHeader}>
                            <Ionicons name="grid-outline" size={20} color="#262626" />
                            <Text style={styles.postsHeaderText}>Posts</Text>
                        </View>
                    </View>
                }
                renderItem={({ item }) => <PostCard post={item} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="images-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No posts yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa'
    },
    header: {
        backgroundColor: '#fff'
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#efefef'
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E1306C',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold'
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        color: '#262626',
        marginBottom: 4
    },
    email: {
        fontSize: 14,
        color: '#8e8e8e',
        marginBottom: 20
    },
    statsContainer: {
        flexDirection: 'row',
        marginBottom: 20
    },
    stat: {
        alignItems: 'center',
        marginHorizontal: 20
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: '#262626'
    },
    statLabel: {
        fontSize: 14,
        color: '#8e8e8e',
        marginTop: 2
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#E1306C',
        borderRadius: 6
    },
    logoutText: {
        color: '#E1306C',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8
    },
    postsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#efefef'
    },
    postsHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#262626',
        marginLeft: 8
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12
    }
});