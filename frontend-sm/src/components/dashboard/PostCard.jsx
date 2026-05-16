import React, { useState, useEffect } from 'react';
import { postsAPI, profileAPI } from '../../services/api';

const PostCard = ({ post, currentUser, onDelete }) => {
    const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isCheckingFollow, setIsCheckingFollow] = useState(false);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!currentUser || currentUser.username === post.username) return;

            try {
                const token = localStorage.getItem('access_token');
                const followingData = await profileAPI.getFollowing(token);
                const following = followingData.followers || [];
                const isUserFollowing = following.some(user => user.username === post.username);
                setIsFollowing(isUserFollowing);
            } catch (error) {
                console.error("Error checking follow status:", error);
            }
        };

        checkFollowStatus();
    }, [currentUser, post.username]);

    const handleLikeToggle = async () => {
        const previousIsLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(!previousIsLiked);
        setLikesCount(prev => prev + (previousIsLiked ? -1 : 1));

        try {
            if (previousIsLiked) {
                await postsAPI.unlike(post.id, currentUser.username);
            } else {
                await postsAPI.like(post.id, currentUser.username);
            }
        } catch (error) {
            setIsLiked(previousIsLiked);
            setLikesCount(previousCount);
            console.error("Error liking post:", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this post?")) return;
        try {
            const token = localStorage.getItem('access_token');
            await postsAPI.delete(post.id, token);
            onDelete(post.id);
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleFollowToggle = async () => {
        if (isCheckingFollow) return;

        setIsCheckingFollow(true);
        try {
            const token = localStorage.getItem('access_token');
            if (isFollowing) {
                await profileAPI.unfollow(post.username, token);
                setIsFollowing(false);
            } else {
                await profileAPI.follow(post.username, token);
                setIsFollowing(true);
            }
            const followingData = await profileAPI.getFollowing(token);
            const following = followingData.followers || [];
            const isUserFollowing = following.some(user => user.username === post.username);
            setIsFollowing(isUserFollowing);
        } catch (error) {
            console.error("Error changing follow status:", error);
            if (error.response?.status === 409) {
                setIsFollowing(true);
            }
        } finally {
            setIsCheckingFollow(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {post.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{post.username || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{new Date(post.created_dt || post.created_at).toLocaleString()}</div>
                        {currentUser?.username !== post.username && (
                            <button
                                onClick={handleFollowToggle}
                                className="mt-1 text-xs text-blue-500 hover:text-blue-700 font-medium"
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>
                {currentUser?.username === post.username && (
                    <button onClick={handleDelete} className="text-red-500 text-sm hover:underline">
                        Delete
                    </button>
                )}
            </div>

            <div className="mb-4 text-gray-800">
                <p className="whitespace-pre-wrap">{post.content}</p>
                {post.image_url && (
                    <img src={post.image_url} alt="Post media" className="mt-3 rounded-lg w-full object-cover max-h-96" />
                )}
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <button
                    onClick={handleLikeToggle}
                    className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                    <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-medium">{likesCount}</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;