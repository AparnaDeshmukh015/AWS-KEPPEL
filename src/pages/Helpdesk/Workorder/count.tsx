import { useEffect, useState } from 'react';
 
const useCountdown = (targetDate: any, current_time: any) => {
  // const countDownDate = new Date(targetDate).getTime();
 
  const [countDown, setCountDown] = useState(
    targetDate - current_time
  );
 
  useEffect(() => {
    const interval = setInterval(() => {
      current_time = current_time + 1000;
      setCountDown(targetDate - current_time);
    }, 1000);
 
    return () => clearInterval(interval);
  }, [targetDate]);
 
  return getReturnValues(countDown);
};
 
const getReturnValues = (countDown: any) => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);
 
  return [days, hours, minutes, seconds];
};
 
export { useCountdown };
 