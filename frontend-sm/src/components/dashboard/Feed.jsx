import React, { useState, useEffect } from 'react';
import { postsAPI } from '../../services/api';
import PostCard from './PostCard';

const Feed = ({ refreshTrigger, user }) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('access_token');
                const data = await postsAPI.getFeed(1, 20, null, token);
                setPosts(Array.isArray(data) ? data : data.items || []);
            } catch (error) {
                console.error("Error loading feed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeed();
    }, [refreshTrigger]);

    const handlePostDeleted = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    };

    if (isLoading) return <div className="text-center py-8 text-gray-500">Loading feed...</div>;

    if (posts.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                The feed is empty. Create your first post or follow other users!
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onDelete={handlePostDeleted}
                />
            ))}
        </div>
    );
};

export default Feed;