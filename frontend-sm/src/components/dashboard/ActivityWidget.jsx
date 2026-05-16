import React, { useEffect, useState } from 'react';
import { activityAPI } from '../../services/api';

const ActivityWidget = ({ user }) => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await activityAPI.getActivity(user.username, 1, 5);
                setActivities(Array.isArray(data) ? data : data.items || []);
            } catch (error) {
                console.error("Error loading activity:", error);
            }
        };
        fetchActivity();
    }, [user.username]);

    if (activities.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Activity</h3>
            <div className="space-y-4">
                {activities.map((activity, idx) => (
                    <div key={idx} className="flex gap-3 items-start text-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 shrink-0">
                            {(activity.username_like || activity.followed_username)?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <span className="font-semibold text-gray-900 mr-1">
                                {activity.liked_post_id ? (activity.username_like || 'Unknown') : (activity.followed_username || 'Unknown')}
                            </span>
                            <span className="text-gray-600">
                                {activity.liked_post_id && 'liked your post.'}
                                {activity.followed_username && 'started following you.'}
                            </span>
                            <div className="text-xs text-gray-400 mt-0.5">{new Date(activity.timestamp || activity.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityWidget;