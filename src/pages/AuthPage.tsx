import Button from "@/components/UI/SiteButton";
import Google from "@/assets/svg/google.svg?react";
import Logo from "@/assets/svg/logo.svg?react";
import AuthPageStickers from "@/assets/png/auth-page-stickers.png";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { isMobileDevice } from '../utils';

export default function AuthPage() {
    const userContext = useUser();
    if (!userContext) {
        throw new Error("useUser must be used within a UserProvider");
    }
    const { setUser } = userContext;
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileError, setShowMobileError] = useState(false);

    useEffect(() => {
        setIsMobile(isMobileDevice());

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const name = urlParams.get('name');
        const profile_picture = urlParams.get('profile_picture');

        if (token && name && profile_picture) {
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Set token expiry to 1 hour
            setUser({ token, name, profile_picture });
            localStorage.setItem('token', token);
            localStorage.setItem('name', name);
            localStorage.setItem('profile_picture', profile_picture);
            localStorage.setItem('tokenExpiry', tokenExpiry.toISOString());
            if (isMobile) {
                setShowMobileError(true);
            } else {
                navigate('/letter');
            }
        } else {
            // Clear localStorage if no token is provided
            localStorage.removeItem('token');
            localStorage.removeItem('name');
            localStorage.removeItem('profile_picture');
            localStorage.removeItem('tokenExpiry');
        }
    }, [setUser, navigate, isMobile]);

    const handleGoogleLogin = () => {
        window.location.href = 'https://posthearts.vercel.app/api/auth/google';
    };

    if (showMobileError) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="bg-white p-4 rounded shadow">
                    <p>Mobile login is not supported. Please use a desktop browser.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center"
            style={{
                backgroundColor: 'hsla(0, 0%, 98%, 1)',
            }}
        >
            <img className="absolute top-0 max-w-[1176px] max-sm:max-w-[364.41px]" src={AuthPageStickers} />
            <div className="flex flex-col items-center px-4 max-sm:mb-20">
                <div className="flex items-center gap-2 mb-6">
                    <Logo />
                    <span className="font-medium text-xs tracking-tight px-2 leading-[18px] rounded-full h-5 flex items-center justify-center bg-candy-gradient">
                        Beta
                    </span>
                </div>
                <h1
                    className="text-[108px] text-center font-normal text-text-default font-hemis leading-[94px] tracking-[-2.98px] max-sm:text-[72px] max-sm:leading-[68px]">
                    Create <br />
                    memories.
                </h1>

                <Button
                    onClick={handleGoogleLogin}
                    className="text-white h-16 max-w-[504px] w-[calc(100vw_-_32px)] rounded-full flex items-center justify-center gap-2 text-base font-semibold leading-[22px] tracking-[0.2px] bg-button-accent mt-6"
                >
                    <Google />
                    Continue with Google
                </Button>
            </div>
        </div>
    );
}