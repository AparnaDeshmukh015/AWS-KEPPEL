
type DateTimeDisplayProps = {
    value: any,
    type: any,
    isDanger: any,
}

const DateTimeDisplay = ({ value, type, isDanger }: DateTimeDisplayProps) => {
  return (
    <div className={isDanger ? 'countdown danger' : 'countdown'}>
      <p>{value}</p>
      <span>{type}</span>
    </div>
  );
};

export default DateTimeDisplay;