import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date;
  onExpire?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, onExpire, className }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        onExpire?.();
        return null;
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const time = calculateTimeLeft();
      if (time === null) {
        clearInterval(timer);
      } else {
        setTimeLeft(time);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (isExpired) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-muted-foreground ${className}`}>
        <Clock className="w-4 h-4" />
        Expired
      </span>
    );
  }

  if (!timeLeft) return null;

  const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes;
  const isUrgent = totalMinutes < 10;

  // Format display based on time remaining
  let displayText = '';
  if (timeLeft.days > 0) {
    displayText = `${timeLeft.days}d ${timeLeft.hours}h left`;
  } else if (timeLeft.hours > 0) {
    displayText = `${timeLeft.hours}h ${timeLeft.minutes}m left`;
  } else {
    displayText = `${timeLeft.minutes}m ${timeLeft.seconds.toString().padStart(2, '0')}s left`;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${isUrgent ? 'text-destructive animate-pulse' : 'text-coral'} ${className}`}>
      <Clock className="w-4 h-4" />
      {displayText}
    </span>
  );
};
