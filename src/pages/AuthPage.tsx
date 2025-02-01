import Button from "@/components/UI/SiteButton";
import Google from "@/assets/svg/google.svg?react";
import Logo from "@/assets/svg/logo.svg?react";
import AuthPageStickers from "@/assets/png/auth-page-stickers.png";
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserContext } from '../context/UserContext';
import { isMobileDevice } from '../utils';

const AuthPage = () => {
    const { setUser } = useContext(UserContext)!;
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileError, setShowMobileError] = useState(false);

    useEffect(() => {
        setIsMobile(isMobileDevice());

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const name = urlParams.get('name');
        const profile_picture = urlParams.get('profile_picture');
        console.log('swwet');

        if (token && name && profile_picture) {
            setUser({ name, profile_picture });
            localStorage.setItem('token', token);
            localStorage.setItem('profile_picture', profile_picture);
            if (isMobile) {
                setShowMobileError(true);
            } else {
                navigate('/letter');
            }
        }
    }, [setUser, navigate, isMobile]);

    const handleGoogleLogin = () => {
        window.location.href = 'https://posthearts.vercel.app/api/auth/google';
    };

    if (showMobileError) {
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
                    <h1 className="text-center text-2xl font-bold">This is not available on mobile yet</h1>
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
};

export default AuthPage;