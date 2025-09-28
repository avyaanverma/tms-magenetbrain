import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function OrganisationForm({ onSubmit, isEditMode = false, initialData = {} }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900 border border-red-700 rounded p-3">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Organisation Name</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
          placeholder="Enter organisation name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
          rows="4"
          placeholder="Enter organisation description"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-600"
        >
          {loading ? 'Saving...' : isEditMode ? 'Update Organisation' : 'Create Organisation'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
