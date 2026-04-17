'use client';

import ChatConsole from '@/modules/chat/ChatConsole';
import { useState, useEffect } from 'react';



export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch customers data
        setLoading(false);
    }, []);

    return (
         <ChatConsole />
    );
}