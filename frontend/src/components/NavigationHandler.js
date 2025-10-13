import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationHandler = () => {
  const location = useLocation();

  useEffect(() => {
    // Push a state entry to prevent forward navigation
    // This is done only once per page load to clear any forward history
    window.history.pushState(null, '', window.location.href);
  }, [location.pathname]);

  return null;
};

export default NavigationHandler;
