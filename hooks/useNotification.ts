'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type NotificationPermissionStatus = NotificationPermission | 'unsupported';

export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermissionStatus>('default');

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    const status = await Notification.requestPermission();
    setPermission(status);
    return status;
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return null;
    }

    return new Notification(title, options);
  }, []);

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: permission !== 'unsupported',
  };
};
