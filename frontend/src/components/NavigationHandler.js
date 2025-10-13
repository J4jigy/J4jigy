import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear forward history by replacing current state
    // This ensures forward navigation is not possible
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event) => {
      // Allow back navigation (default behavior)
      // But prevent forward by always pushing state
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);

  return null;
};

export default NavigationHandler;
