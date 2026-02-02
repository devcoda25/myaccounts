import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { StatusModal, StatusType } from '../components/ui/StatusModal';

interface NotificationOptions {
    title: string;
    message: string;
    type: StatusType;
    actionText?: string;
    onAction?: () => void;
    loading?: boolean;
}

interface NotificationContextType {
    showNotification: (options: NotificationOptions) => void;
    hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [options, setOptions] = useState<NotificationOptions | null>(null);

    const showNotification = useCallback((newOptions: NotificationOptions) => {
        setOptions(newOptions);
        setModalOpen(true);
    }, []);

    const hideNotification = useCallback(() => {
        setModalOpen(false);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            {options && (
                <StatusModal
                    open={modalOpen}
                    type={options.type}
                    title={options.title}
                    message={options.message}
                    actionText={options.actionText}
                    loading={options.loading}
                    onClose={hideNotification}
                    onAction={() => {
                        if (options.onAction) options.onAction();
                        hideNotification();
                    }}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
