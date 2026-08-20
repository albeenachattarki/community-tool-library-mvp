import React, { useState, useEffect } from 'react';
import ToolList from './components/ToolList';
import AddToolForm from './components/AddToolForm';
import './App.css';

function App() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tools');
      if (!response.ok) throw new Error('Failed to fetch tools');
      const data = await response.json();
      setTools(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolAdded = () => {
    fetchTools();
  };

  const handleToolUpdate = (updatedTool) => {
    setTools((currentTools) => currentTools.map((tool) => (
      tool.id === updatedTool.id ? updatedTool : tool
    )));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span className="icon">🛠️</span>
          <h1>Community Tool Library</h1>
        </div>
        <p className="subtitle">Borrow what you need. Share what you own.</p>
      </header>

      <main className="app-content">
        <section>
          <AddToolForm onToolAdded={handleToolAdded} />
        </section>
        <section>
          {loading
            ? <div className="loader">Loading tools...</div>
            : <ToolList tools={tools} onUpdateTool={handleToolUpdate} />
          }
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2026 Community Tool Library</p>
      </footer>
    </div>
  );
}

export default App;
