import '../styles/TimeComponent.css';

export default function TimeComponent({time}) {
  return (
    <div className="time-component-background">
      <p className="estimated-arrival-text">Estimated Arrival</p>
      <p className="time-component-font">{time}</p>
    </div>
  );
}