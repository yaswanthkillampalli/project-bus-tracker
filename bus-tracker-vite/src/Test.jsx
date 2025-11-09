import { useState, useEffect } from 'react';
import './Test.css';
import { RiTriangleFill } from "react-icons/ri";
import NextLocationComponent from './components/NextLocationComponent';
import TimeComponent from './components/TimeComponent';
import PuffLoader from "react-spinners/PuffLoader"; // Install with npm if needed
import RouteInfoComponent from './components/RouteInfoComponent';
import MapComponent from './components/MapComponent';

const route1 = [
  { lat: 16.49101, lng: 80.60530 },
  { lat: 16.48847, lng: 80.60746 },
  { lat: 16.48214, lng: 80.61064 },
  { lat: 16.48019, lng: 80.61709 },
  { lat: 16.48416, lng: 80.61940 },
  { lat: 16.49963, lng: 80.63784 },
  { lat: 16.49354, lng: 80.64746 },
  { lat: 16.49161, lng: 80.65077 },
  { lat: 16.49046, lng: 80.65267 },
  { lat: 16.49030, lng: 80.65454 },
  { lat: 16.49141, lng: 80.65525 },
  { lat: 16.49341, lng: 80.65693 },
  { lat: 16.49564, lng: 80.65727 },
  { lat: 16.49672, lng: 80.65834 },
  { lat: 16.46853, lng: 80.73905 },
];

const route2 = [
  { lat: 16.524292, lng: 80.677745 },
  { lat: 16.524472, lng: 80.684091 },
  { lat: 16.523475, lng: 80.686535 },
  { lat: 16.521695, lng: 80.690613 },
  { lat: 16.517922, lng: 80.698006 },
  { lat: 16.515261, lng: 80.703120 },
  { lat: 16.511676, lng: 80.712421 },
  { lat: 16.508987, lng: 80.720290 },
  { lat: 16.505959, lng: 80.718906 },
  { lat: 16.480095, lng: 80.709609 },
  { lat: 16.476118, lng: 80.707286 },
  { lat: 16.468597, lng: 80.739118 }
];

export default function Test() {
  const allPaths = [
    {
      id:1,
      path: route1,
      color: '#FF0000'
    },
    {
      id:2,
      path: route2,
      color: '#FF0000'
    }
  ]
  const array = [
    { id: 1, name: 'Item 1', time: '12:35' },
    { id: 2, name: 'Item 2', time: '12:40' },
    { id: 3, name: 'Item 3', time: '12:45' },
    { id: 4, name: 'Item 4', time: '12:50' },
    { id: 5, name: 'Item 5', time: '12:55' },
    { id: 6, name: 'Item 6', time: '13:00' },
    { id: 7, name: 'Item 7', time: '13:05' },
    { id: 8, name: 'Item 8', time: '13:10' },
    { id: 9, name: 'Item 9', time: '13:15' },
    { id: 10, name: 'Item 10', time: '13:20' }
  ];

  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [currentRoute, setCurrentRoute] = useState(allPaths);

  const handleUpdateRoute = (newRoute) => {
    setCurrentRoute(newRoute);
    console.log("Route updated! The map will now change dynamically.");
  };
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className='background'>
        <MapComponent routeCoordinates={currentRoute} />
      </div>
      <div className='top-layer-north'>
        <TimeComponent time="12:30" />
        <RouteInfoComponent />
      </div>
      <div
        className={`top-layer${expanded ? ' expanded' : ' collapsed'}`}
        style={{
          height: expanded ? 300 : 70, 
        }}
      >
        <div className="top-layer-next-destination">
          <div className='top-layer-next-desination-icon-text-div' onClick={() => setExpanded(!expanded)} style={{cursor: 'pointer'}}>
            <RiTriangleFill
              className={`top-layer-next-desination-icon ${expanded ? '' : 'collapsed-icon'}`}
              style={{
                transition: 'transform 0.3s',
                transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)'
              }}
            />
            <h2 className="top-layer-next-desination-title">Next Destination</h2>
          </div>
          <div className='top-layer-next-desination-time'>
            <p className='top-layer-time'>12:30</p>
          </div>
        </div>
        <div className="top-layer-next-location">
          {loading ? (
            <div className="loader-container">
              <PuffLoader color="#fff" size={40} />
            </div>
          ) : (
            expanded && array.map(item => (
              <NextLocationComponent
                key={item.id}
                isIconPresent={true}
                locationName={item.name}
                timeInfo={item.time}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
