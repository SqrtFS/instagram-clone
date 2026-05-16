import React, { useEffect, useState } from 'react';
import { profileAPI } from '../../services/api';

const ProfileSidebar = ({ user }) => {
    const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profileAPI.getProfile(user.username);
                setStats({
                    followers: data.followers_count || 0,
                    following: data.following_count || 0,
                    posts: data.posts_count || 0
                });
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        };
        fetchProfile();
    }, [user.username]);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-xl">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="font-bold text-gray-900">{user.username}</h2>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
            </div>

            <div className="flex justify-between text-center pt-4 border-t border-gray-100">
                <div>
                    <div className="font-bold text-gray-900">{stats.posts}</div>
                    <div className="text-xs text-gray-500">Posts</div>
                </div>
                <div>
                    <div className="font-bold text-gray-900">{stats.followers}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div>
                    <div className="font-bold text-gray-900">{stats.following}</div>
                    <div className="text-xs text-gray-500">Following</div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;