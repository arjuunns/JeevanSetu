'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { EmergencyAlertData } from '../components/EmergencyToast';

export function useEmergencySocket() {
  const [activeAlert, setActiveAlert] = useState<EmergencyAlertData | null>(null);

  useEffect(() => {
    const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    // Connect to the socket server
    const socket: Socket = io(apiHost, {
      path: '/realtime',
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to realtime socket server, subscribing to emergency room...');
      // Subscribe to the emergency room
      socket.emit('subscribe', 'emergency');
    });

    socket.on('emergency', (data: any) => {
      console.log('Received real-time emergency broadcast:', data);
      setActiveAlert({
        id: Math.random().toString(36).substring(2, 9),
        department: data.department || 'Emergency',
        title: data.title || 'Critical Emergency Alert',
        body: data.body || 'Immediate response needed.',
        visitId: data.payload?.visitId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from realtime socket server.');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const dismissAlert = () => setActiveAlert(null);

  return { activeAlert, dismissAlert };
}
