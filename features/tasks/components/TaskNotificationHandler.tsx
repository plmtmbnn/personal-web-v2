'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useNotification } from '@/lib/hooks/useNotification';
import { Task } from '@/features/tasks/types';
import { calculateProgress } from '@/features/tasks/utils';
import { Bell, BellOff, BellRing } from 'lucide-react';

interface TaskNotificationHandlerProps {
  tasks: Task[];
}

export default function TaskNotificationHandler({ tasks }: TaskNotificationHandlerProps) {
  const { permission, requestPermission, sendNotification, isSupported } = useNotification();
  const [isMuted, setIsMuted] = useState(false);
  const notifiedTasksRef = useRef<{ [key: string]: string[] }>({}); // date-time -> [taskIds]
  const goalReachedRef = useRef<boolean>(false);

  // Load mute state from localStorage
  useEffect(() => {
    const storedMute = localStorage.getItem('tasks-notifications-muted');
    if (storedMute === 'true') {
      setIsMuted(true);
    }
  }, []);

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    localStorage.setItem('tasks-notifications-muted', String(newMute));
  };

  useEffect(() => {
    if (permission !== 'granted' || isMuted) return;

    const checkReminders = () => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const key = `${dateStr}-${timeStr}`;

      // Check for specific times: 10:00 AM or 02:00 PM
      if (timeStr === '10:00' || timeStr === '14:00') {
        const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH' && !t.is_completed);
        
        highPriorityTasks.forEach(task => {
          if (!notifiedTasksRef.current[key]?.includes(task.id)) {
            sendNotification('Heads up!', {
              body: `You have a high-priority task: ${task.title}`,
            });

            if (!notifiedTasksRef.current[key]) {
              notifiedTasksRef.current[key] = [];
            }
            notifiedTasksRef.current[key].push(task.id);
          }
        });
      }

      // Progress check for "Goal Reached!"
      const progress = calculateProgress(tasks);
      if (progress === 100 && tasks.length > 0 && !goalReachedRef.current) {
        sendNotification('Goal Reached!', {
          body: "All tasks completed! You've crushed it. 🎉",
        });
        goalReachedRef.current = true;
      } else if (progress < 100) {
        goalReachedRef.current = false;
      }
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [tasks, permission, sendNotification, isMuted]);

  if (!isSupported) return null;

  return (
    <div className="flex items-center justify-between mb-6 glass-card p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${permission === 'granted' && !isMuted ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
          {permission === 'granted' && !isMuted ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </div>
        <div>
          <h3 className="text-sm font-bold">Desktop Notifications</h3>
          <p className="text-xs text-muted-foreground">
            {permission === 'default' ? 'Stay updated with task alerts.' : 
             permission === 'denied' ? 'Alerts are blocked in your browser.' :
             isMuted ? 'Notifications are currently muted.' : 'Active: 10:00 AM, 02:00 PM & 100% Progress'}
          </p>
        </div>
      </div>

      {permission === 'default' && (
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all text-sm font-medium shadow-sm"
        >
          Enable Alerts
        </button>
      )}

      {permission === 'granted' && (
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded-xl transition-all text-sm font-medium border ${
            isMuted 
              ? 'bg-background hover:bg-muted text-foreground border-border' 
              : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
          }`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      )}
    </div>
  );
}
