import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface PostCardProps {
    post: {
        id: string;
        authorName: string;
        text: string;
        imageUrl?: string;
        timestamp: string;
    };
}

export default function PostCard({ post }: PostCardProps) {
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {post.authorName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
                </View>
            </View>

            {post.imageUrl && (
                <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.postImage}
                    resizeMode="cover"
                />
            )}

            {post.text && (
                <View style={styles.textContainer}>
                    <Text style={styles.postText}>{post.text}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginBottom: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#efefef',
        shadowColor: '#000',
        margin: 10,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 5
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E1306C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    headerText: {
        flex: 1
    },
    authorName: {
        fontWeight: '600',
        fontSize: 14,
        color: '#262626'
    },
    timestamp: {
        fontSize: 12,
        color: '#8e8e8e',
        marginTop: 2
    },
    postImage: {
        width: '100%',
        height: 400,
        backgroundColor: '#f0f0f0'
    },
    textContainer: {
        padding: 12
    },
    postText: {
        fontSize: 14,
        color: '#262626',
        lineHeight: 18
    }
});