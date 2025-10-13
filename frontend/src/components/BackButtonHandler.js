import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Push current state to allow back button to work
    window.history.pushState(null, '', window.location.href);

    const handleBackButton = (event) => {
      const currentPath = location.pathname;
      
      // If not on dashboard or login, go to dashboard
      if (currentPath !== '/' && currentPath !== '/login') {
        event.preventDefault();
        navigate('/', { replace: true });
      }
    };

    // Listen for back button press
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [location, navigate]);

  return null; // This component doesn't render anything
};

export default BackButtonHandler;
