import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

const RouteTransition: React.FC = () => {
  const location = useLocation();
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    setShowContent(false);
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="route-transition-container">
      <div className={`route-transition-content ${showContent ? 'fade-in' : 'fade-out'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default RouteTransition;
