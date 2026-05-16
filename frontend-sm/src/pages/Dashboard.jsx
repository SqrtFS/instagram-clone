import React, { useState } from 'react';
import { useAuth } from "../contexts/AuthContext";
import CreatePost from '../components/dashboard/CreatePost';
import Feed from '../components/dashboard/Feed';
import ProfileSidebar from '../components/dashboard/ProfileSidebar';
import ActivityWidget from '../components/dashboard/ActivityWidget';

const Dashboard = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Функция для обновления ленты после создания нового поста
    const triggerFeedRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Пожалуйста, войдите</h1>
                    <p className="text-gray-600">Для доступа к ленте нужна авторизация.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">

                {/* Левая колонка: Создание поста и Лента */}
                <div className="flex-1 max-w-2xl w-full mx-auto lg:mx-0 space-y-6">
                    <CreatePost onPostCreated={triggerFeedRefresh} user={user} />
                    <Feed refreshTrigger={refreshTrigger} user={user} />
                </div>

                {/* Правая колонка: Профиль и Активность (скрывается на мобилках) */}
                <div className="hidden lg:flex flex-col w-80 space-y-6">
                    <ProfileSidebar user={user} />
                    <ActivityWidget user={user} />
                </div>

            </div>
        </div>
    );
};

export default Dashboard;