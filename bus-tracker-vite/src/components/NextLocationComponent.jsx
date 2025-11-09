import { FaLocationDot } from "react-icons/fa6";
import '../styles/NextLocationComponent.css';
export default function NextLocationComponent({isIconPresent, locationName, timeInfo}) {
  return (
    <div className="next-location-info-div">
      {isIconPresent && <FaLocationDot className="next-location-icon" />}
      <h2 className="next-location-title">{locationName}</h2>
      <p className="next-location-time">{timeInfo}</p>
    </div>
  )
}