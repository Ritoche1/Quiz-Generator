"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default function ResetPasswordPage() {
    return (
        <>
            <Navigation user={null} onRedoQuiz={() => {}} onNewQuiz={() => {}} />
            <div className="min-h-screen pb-16 gradient-bg flex flex-col items-center justify-center text-white p-4">
                <ResetPasswordForm />
            </div>
            <Footer />
        </>
    );
}
