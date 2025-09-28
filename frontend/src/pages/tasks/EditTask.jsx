import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TaskForm from '../../components/tasks/TaskForm';

export default function EditTask() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/task/${taskId}`, {
          withCredentials: true
        });
        setTask(response.data);
      } catch (err) {
        setError('Failed to fetch task details');
        console.error('Error fetching task:', err);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const handleSubmit = async (formData) => {
    try {
      await axios.put(`http://localhost:3000/api/task/tasks/${taskId}`, formData, {
        withCredentials: true
      });
      navigate('/dashboard');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-2xl mx-auto">
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-red-400 mb-6">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-green-400 mb-6">Edit Task</h2>
        <TaskForm 
          task={task}
          orgId={task.organisation}
          onSubmit={handleSubmit}
          isEditMode={true}
        />
      </div>
    </div>
  );
}
