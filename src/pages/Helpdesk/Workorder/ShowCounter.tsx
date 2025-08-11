import React from 'react';
import './showCounter.css'
import DateTimeDisplay from './DateTimeDisplay';
import { useCountdown } from './count';

type ShowCounterProps = {
    days: any,
    hours: any,
    minutes: any,
    seconds: any,
}

export function ShowCounter({ days, hours, minutes, seconds }: ShowCounterProps) {

    return (
        <>
            {/* {(seconds === 1 || seconds === 0) && (minutes === 0) ?
        "Overdue": */}
            <div className="show-counter">
                <div
                    className="countdown-link"
                >
                    <DateTimeDisplay value={days} type={'Days'} isDanger={days <= 3} />
                    <p>:</p>
                    <DateTimeDisplay value={hours} type={'Hours'} isDanger={false} />
                    <p>:</p>
                    <DateTimeDisplay value={minutes} type={'Mins'} isDanger={false} />
                    <p>:</p>
                    <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={false} />
                </div>
            </div>
            {/* } */}
        </>
    );
}


const CountdownTimer = ({ targetDate, getOptionDetails ,current_time}: any) => {
    // const [days, hours, minutes, seconds] = useCountdown(targetDate);
    const [days, hours, minutes, seconds] = useCountdown(targetDate, current_time);

    if (days + hours + minutes + seconds == 0) {
        getOptionDetails();
        return <>

        </>;
    }
    else if (days + hours + minutes + seconds <= 0) {
    
        return <>

        </>;
    }
    else {
        return (
            <ShowCounter

                days={days}
                hours={hours}
                minutes={minutes}
                seconds={seconds}
            />
        );
    }
}

export default CountdownTimer;
