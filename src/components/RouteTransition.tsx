import React from 'react';
import { Outlet } from 'react-router-dom';

const RouteTransition: React.FC = () => {
  return (
    <div className="route-transition-container">
      <div className="route-transition-content fade-in">
        <Outlet />
      </div>
    </div>
  );
};

export default RouteTransition;
