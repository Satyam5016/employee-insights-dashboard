import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import VirtualizedList from '../components/VirtualizedList';

const List = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Intentional Bug: Missing dependency in useEffect causing stale closure.
  // The username could change but this effect won't re-run.
  // We use user.username in fetchData but don't include user.username in the dependency array.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: user.username, 
            password: 'Test123' 
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        if (result && result.TABLE_DATA && result.TABLE_DATA.data) {
          setData(result.TABLE_DATA.data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.username]); 

  const handleRowClick = (item) => {
    // Navigate to details page using the employee ID (index 3 in the array)
    const employeeId = item[3];
    navigate(`/details/${employeeId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-6 flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Employee Roster</h1>
          <p className="text-neutral-400 text-sm mt-1">Found {data.length} records</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-400">
            Logged in as <span className="text-white font-medium">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-neutral-400">
            Loading directory data...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-500">
            Error: {error}
          </div>
        ) : (
          <VirtualizedList data={data} onRowClick={handleRowClick} />
        )}
      </main>
    </div>
  );
};

export default List;
