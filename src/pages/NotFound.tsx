
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center px-4 max-w-md">
        <img 
          src="/lovable-uploads/11ec3d18-cf25-4232-b280-5199f06af73b.png" 
          alt="Good Tree Church Logo" 
          className="h-20 w-20 mx-auto mb-6" 
        />
        <h1 className="text-4xl font-bold text-goodtree mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">
          The page you're looking for couldn't be found.
        </p>
        <a 
          href="/" 
          className="bg-goodtree text-white px-6 py-3 rounded-lg shadow-hover transition-all duration-300 inline-block hover:bg-goodtree-light"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
