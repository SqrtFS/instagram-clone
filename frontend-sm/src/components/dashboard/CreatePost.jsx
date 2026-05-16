import React, { useState } from 'react';
import { postsAPI } from '../../services/api';

const CreatePost = ({ onPostCreated, user }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            await postsAPI.create({ content: content }, token);
            setContent('');
            onPostCreated();
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <form onSubmit={handleSubmit} className="flex-1">
                    <textarea
                        className="w-full bg-gray-50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="3"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            type="submit"
                            disabled={!content.trim() || isSubmitting}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;