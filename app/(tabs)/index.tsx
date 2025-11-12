import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../../components/PostCard';
import { useSupabase } from '@/config/useSupabase';

interface Post {
  id: string;
  authorName: string;
  authorId: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export default function HomeFeed() {
  const supabase = useSupabase();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPosts = async () => {
    if (!supabase) {
      console.log('Supabase not initialized');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching posts...');

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Posts data:', data);
      console.log('Posts error:', error);

      if (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!data) {
        console.log('No data returned');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('Number of posts:', data.length);

      const postsData: Post[] = data.map((post) => {
        console.log('Mapping post:', post);
        return {
          id: post.id,
          authorName: post.author_name || 'Unknown',
          authorId: post.author_id,
          text: post.text || '',
          imageUrl: post.image_url,
          timestamp: post.created_at,
        };
      });

      console.log('Mapped posts:', postsData);
      setPosts(postsData);
    } catch (err) {
      console.error('Exception fetching posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#E1306C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          console.log('Rendering post:', item);
          return <PostCard post={item} />;
        }}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E1306C"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-post')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E1306C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});