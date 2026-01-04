import React from "react";

export function IconBase({ size = 24, children, className }: { size?: number; children: React.ReactNode; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
            focusable="false"
            style={{ display: "block" }}
        >
            {children}
        </svg>
    );
}

export function MtnMomoLogo({ size = 24 }: { size?: number }) {
    // MTN Yellow circle with black text or stylized 'M'
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#FFCC00" />
            <path d="M7 16h3.5l1.5-5 1.5 5h4l1.5-5 1.5 5h3.5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

export function AirtelMoneyLogo({ size = 24 }: { size?: number }) {
    // Airtel Red square/circle
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="32" height="32" rx="6" fill="#E60000" />
            <path d="M6 22l10-14 10 14H6z" fill="#FFF" />
            <path d="M16 19a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#E60000" />
        </svg>
    );
}

export function VisaLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 64 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M24.3 0h-3.9c-1.4 0-2.5.4-3.1 2l-3.6 8.7-1.5-7.3C11.9 1.1 11.5 0 9.8 0H.1L0 .5c2.3.6 4.9 1.5 6.5 2.5l5.7 10.7h6.6L24.3 0zm5.6 13h6L36 0h-5.2zm21.6 0H57l-2.4-13h-4.3l-2.8 9.5c-.3.7-.8 1.1-1.6 1.1h-4.8l-.5 2.4h8.8c1.3 0 2.4-.4 2.8-1.5l2.4-11.5z" fill="#1A1F71" />
        </svg>
    );
}

export function MastercardLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#EB001B" opacity="0.8" />
            <circle cx="44" cy="20" r="20" fill="#F79E1B" opacity="0.8" />
        </svg>
    );
}

export function PayPalLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.5 13.5c-.6 3-3.7 4.5-6.8 4.7l-1 .1h-3l-.2 1.5-.7 4.2h-3.2l2-12.8c.2-1 .7-1.3 1.8-1.3h5.2c4.4 0 6.5 1.7 5.9 5.6" fill="#003087" />
            <path d="M22.8 13.5c-.6 3-3.7 4.5-6.8 4.7l-1 .1h-3l-.2 1.5-.7 4.2h-3.2l.6-4.1.8-5h.2c4.4 0 6.5 1.7 5.9 5.6" fill="#009cde" />
            <path d="M10.8 24l.7-4.2h3l1-.1c3-.2 6.1-1.7 6.8-4.7l-.3 1.9c-.6 3-3.7 4.5-6.8 4.7l-1 .1h-3l-.4 2.3h-3.2z" fill="#012169" />
        </svg>
    );
}

// Map from provider string (backend) to component
export function AfricellLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#652D92" />
            <path d="M16 6c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S21.5 6 16 6zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="#FFF" />
        </svg>
    );
}

export function GooglePayLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fill="#5F6368" fontWeight="bold">GPay</text>
        </svg>
    );
}

export function ApplePayLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fill="#000" fontWeight="bold">ApplePay</text>
        </svg>
    );
}

export function BankTransferLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21h18M5 21v-7m8 7v-7m6 7v-7M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v0H4v0zm8-8l9 6H3l9-6z" />
        </svg>
    );
}

// New Provider Components
export function AdyenLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fill="#0ABF53" fontWeight="bold">adyen</text>
        </svg>
    );
}

export function AlipayLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="4" fill="#1677FF" />
            <path d="M12 21c4.5 0 9-2 9-2" stroke="#FFF" strokeWidth="2" fill="none" />
            <path d="M16 8v8m-5-6h10" stroke="#FFF" strokeWidth="2" />
        </svg>
    );
}

export function DPOGroupLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#0055A5" fontWeight="bold">DPO</text>
        </svg>
    );
}

export function FlutterwaveLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10l5-5 5 5M10 10l5 5 5-5" stroke="#F5A623" strokeWidth="3" fill="none" />
            <text x="35" y="14" fontSize="12" fill="#12263F" fontWeight="bold">FLW</text>
        </svg>
    );
}

export function JumiaPayLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#F68B1E" fontWeight="bold">Jumia</text>
        </svg>
    );
}

export function PayoneerLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#FF4800" fontWeight="bold">Payoneer</text>
        </svg>
    );
}

export function PaystackLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#00C3F7" fontWeight="bold">Paystack</text>
        </svg>
    );
}

export function PaytotaLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#6A0DAD" fontWeight="bold">Paytota</text>
        </svg>
    );
}

export function PesapalLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#0093E8" fontWeight="bold">Pesapal</text>
        </svg>
    );
}

export function SquareLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="3" fill="#3E4348" />
            <rect x="7" y="7" width="10" height="10" rx="1" stroke="#FFF" strokeWidth="2" fill="none" />
            <rect x="10" y="10" width="4" height="4" fill="#FFF" />
        </svg>
    );
}

export function StripeLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fill="#635BFF" fontWeight="bold">stripe</text>
        </svg>
    );
}

export function UnionPayLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="20" rx="2" fill="#0072CE" />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fill="#FFF" fontWeight="bold">UnionPay</text>
        </svg>
    );
}

export function WeChatPayLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#09B83E" fontWeight="bold">WeChat</text>
        </svg>
    );
}

export function WorldpayLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#DA291C" fontWeight="bold">Worldpay</text>
        </svg>
    );
}


export const getProviderIcon = (provider: string, size = 24) => {
    const p = provider.toLowerCase();

    // Original mappings
    if (p.includes('mtn')) return <MtnMomoLogo size={size} />;
    if (p.includes('airtel')) return <AirtelMoneyLogo size={size} />;
    if (p.includes('africell')) return <AfricellLogo size={size} />;
    if (p.includes('visa')) return <VisaLogo size={size} />;
    if (p.includes('mastercard')) return <MastercardLogo size={size} />;
    if (p.includes('paypal')) return <PayPalLogo size={size} />;
    if (p.includes('google')) return <GooglePayLogo size={size} />;
    if (p.includes('apple')) return <ApplePayLogo size={size} />;
    if (p.includes('bank')) return <BankTransferLogo size={size} />;

    // New mappings from apwgapi/gateways
    if (p.includes('adyen')) return <AdyenLogo size={size} />;
    if (p.includes('alipay')) return <AlipayLogo size={size} />;
    if (p.includes('dpo')) return <DPOGroupLogo size={size} />;
    if (p.includes('flutterwave')) return <FlutterwaveLogo size={size} />;
    if (p.includes('jumia')) return <JumiaPayLogo size={size} />;
    if (p.includes('payoneer')) return <PayoneerLogo size={size} />;
    if (p.includes('paystack')) return <PaystackLogo size={size} />;
    if (p.includes('paytota')) return <PaytotaLogo size={size} />;
    if (p.includes('pesapal')) return <PesapalLogo size={size} />;
    if (p.includes('square')) return <SquareLogo size={size} />;
    if (p.includes('stripe')) return <StripeLogo size={size} />;
    if (p.includes('union')) return <UnionPayLogo size={size} />;
    if (p.includes('wechat')) return <WeChatPayLogo size={size} />;
    if (p.includes('worldpay')) return <WorldpayLogo size={size} />;

    // Default Generic Card
    return (
        <IconBase size={size}>
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
};

export const getProviderColor = (provider: string) => {
    const p = provider.toLowerCase();

    // Original Colors
    if (p.includes('mtn')) return '#FFCC00';
    if (p.includes('airtel')) return '#E60000';
    if (p.includes('africell')) return '#652D92';
    if (p.includes('visa')) return '#1A1F71';
    if (p.includes('mastercard')) return '#EB001B';
    if (p.includes('paypal')) return '#003087';
    if (p.includes('google')) return '#5F6368';
    if (p.includes('apple')) return '#000000';

    // New Colors
    if (p.includes('adyen')) return '#0ABF53';
    if (p.includes('alipay')) return '#1677FF';
    if (p.includes('dpo')) return '#0055A5';
    if (p.includes('flutterwave')) return '#F5A623';
    if (p.includes('jumia')) return '#F68B1E';
    if (p.includes('payoneer')) return '#FF4800';
    if (p.includes('paystack')) return '#00C3F7';
    if (p.includes('paytota')) return '#6A0DAD';
    if (p.includes('pesapal')) return '#0093E8';
    if (p.includes('square')) return '#3E4348';
    if (p.includes('stripe')) return '#635BFF';
    if (p.includes('union')) return '#0072CE';
    if (p.includes('wechat')) return '#09B83E';
    if (p.includes('worldpay')) return '#DA291C';

    return '#03cd8c'; // EVzone green
};
