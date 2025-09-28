import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const [organisations, setOrganisations] = useState([]);
  const [userOrgs, setUserOrgs] = useState([]);  // Organizations extracted from user's tasks
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userType, setUserType] = useState('');
  const [allUserTasks, setAllUserTasks] = useState([]); // Store all user tasks
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch organizations
  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/organisation/", { 
          withCredentials: true 
        });
        
        const orgsArray = Array.isArray(res.data.organisations) ? res.data.organisations : [];
        console.log("Organizations:", orgsArray);
        
        setOrganisations(orgsArray);
        
        if (orgsArray.length > 0) {
          setSelectedOrg(orgsArray[0]._id);
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setOrganisations([]);
      }
    };
    fetchOrganisations();
  }, []);

  // Detect user type
  useEffect(() => {
    const detectUserType = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/check-role", { 
          withCredentials: true 
        });
        setUserType(response.data.role);
      } catch (error) {
        console.error("Error detecting user type:", error);
        setUserType('user');
      }
    };
    
    detectUserType();
  }, []);

  // Fetch tasks - using useCallback to prevent infinite re-renders
  const fetchTasksForOrg = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if(userType === '') return;

      if(userType === 'user') {
        // For users, fetch all their tasks from /api/task/my
        const response = await axios.get('http://localhost:3000/api/task/my', {
          withCredentials: true
        });

        console.log(response);
        
        let allTasks = [];
        if (response.data.tasks && Array.isArray(response.data.tasks)) {
          allTasks = response.data.tasks;
        } else if (Array.isArray(response.data)) {
          allTasks = response.data;
        }

        setAllUserTasks(allTasks);

        // Extract unique organizations from tasks and their names
        const orgMap = new Map();
        allTasks.forEach(task => {
          if (task.organisation && task.organisation._id) {
            orgMap.set(task.organisation._id, {
              _id: task.organisation._id,
              name: task.organisation.name || task.organisation.title || 'Unknown Organization'
            });
          }
        });
        
        const orgsWithNames = Array.from(orgMap.values());
        console.log("Extracted organizations:", orgsWithNames);
        setUserOrgs(orgsWithNames);

        // Always select the first org if none selected or current selection not in orgsWithNames
        if (orgsWithNames.length > 0 && (!selectedOrg || !orgsWithNames.find(org => org._id === selectedOrg))) {
          console.log("Setting initial org:", orgsWithNames[0]._id);
          setSelectedOrg(orgsWithNames[0]._id);
        }

        // Filter tasks based on selected organization
        const filteredTasks = selectedOrg 
          ? allTasks.filter(task => task.organisation?._id === selectedOrg)
          : allTasks;

        setTasks(filteredTasks);
        calculateStats(filteredTasks);

      } else if(userType === 'admin') {
        if (!selectedOrg) {
          setTasks([]);
          setStats({ total: 0, pending: 0, completed: 0, overdue: 0 });
          return;
        }

        const response = await axios.get(`http://localhost:3000/api/task`, {
          withCredentials: true,
          params: { organisation: selectedOrg }
        });

        let tasksData = [];
        if (response.data.tasks && Array.isArray(response.data.tasks)) {
          tasksData = response.data.tasks;
        } else if (Array.isArray(response.data)) {
          tasksData = response.data;
        }

        setTasks(tasksData);
        calculateStats(tasksData);
      }

    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks');
      setTasks([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, userType]);

  // Fetch tasks when dependencies change
  useEffect(() => {
    if (userType) {
      fetchTasksForOrg();
    }
  }, [selectedOrg, userType, fetchTasksForOrg]);

  const calculateStats = (tasksArray) => {
    const total = tasksArray.length;
    const pending = tasksArray.filter(task => task.status === 'pending').length;
    const completed = tasksArray.filter(task => task.status === 'completed').length;
    
    const overdue = tasksArray.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date();
    }).length;

    setStats({ total, pending, completed, overdue });
  };

  const filterTasksByPriority = (priority) => {
    return tasks.filter(task => task.priority === priority);
  };

  const handleOrgChange = (e) => {
    const orgId = e.target.value;
    console.log("Selected Organization ID:", orgId);
    setSelectedOrg(orgId);
  };

  const handleCreateTask = () => {
    if (selectedOrg) {
      navigate(`/tasks/create?organisation=${selectedOrg}`);
    } else {
      alert("Please select an organization first");
    }
  };

  const handleCreateOrg = () => {
    navigate('/organisation/create');
  };

  const handleEditTask = (taskId) => {
    navigate(`/tasks/edit/${taskId}`);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/task/deleteTask/${taskId}`, {
        withCredentials: true
      });
      fetchTasksForOrg();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/task/tasks/${taskId}`, {
        status: newStatus
      }, {
        withCredentials: true
      });
      fetchTasksForOrg();
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-900/20';
      default: return 'border-gray-700 bg-gray-800';
    }
  };

  const canCreateTask = userType === 'admin';

  // Task Card Component
  const TaskCard = ({ task }) => (
    <div className={`mb-4 border-2 rounded-lg p-3 ${getPriorityColor(task.priority)}`}>
      <div className="flex justify-between items-start">
        <p className="font-bold text-lg">{task.title}</p>
        {userType === 'admin' && (
          <div className="flex gap-2">
            <button 
              onClick={() => handleEditTask(task._id)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Edit
            </button>
            <button 
              onClick={() => handleDeleteTask(task._id)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-400 mt-2">
        {task.description || 'No description available'}
      </p>
      
      <div className="flex justify-between items-center mt-3">
        <p className="text-xs text-gray-500">
          Due: {formatDate(task.dueDate)}
        </p>
        
        {userType === 'user' ? (
          <select 
            value={task.status}
            onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
            className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(task.status)} bg-gray-800`}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        ) : (
          <p className={`text-xs font-semibold ${getStatusColor(task.status)}`}>
            {task.status.toUpperCase()}
          </p>
        )}
      </div>
      
      {userType === 'admin' && task.assignedTo && (
        <p className="text-xs mt-2 text-gray-400">
          Assigned To: {task.assignedTo.name || task.assignedTo.email || 'User ID: ' + task.assignedTo}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-400">Task Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Logged in as: <span className="capitalize font-semibold">{userType || 'detecting...'}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <select 
            className="px-3 py-2 rounded bg-gray-800 text-white min-w-48"
            value={selectedOrg || ""}
            onChange={handleOrgChange}
          >
            <option value="">Select Organisation</option>
            {userType === 'admin' ? (
              organisations.map(org => (
                <option key={org._id} value={org._id}>
                  {org.name || org.title}
                </option>
              ))
            ) : (
              userOrgs.map(org => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))
            )}
          </select>
          
          {canCreateTask && (
            <>
              <button 
                className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                onClick={handleCreateOrg}
              >
                Create Org
              </button>
              <button 
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-600"
                onClick={handleCreateTask}
                disabled={!selectedOrg}
              >
                Create Task
              </button>
            </>
          )}
        </div>
      </div>

      {((userType === 'admin' && organisations.length === 0) || 
        (userType === 'user' && userOrgs.length === 0)) && (
        <div className="bg-yellow-900 border border-yellow-700 rounded p-4 mb-6">
          <p className="text-yellow-300">
            {userType === 'admin' 
              ? `No organizations found. ${canCreateTask ? "Create an organization to get started." : ""}`
              : "You don't have any tasks assigned yet."}
          </p>
        </div>
      )}

      {loading && <p className="text-center">Loading tasks...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {selectedOrg && !loading && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded p-4 text-center">
              <p className="text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-green-400">{stats.total}</p>
            </div>
            <div className="bg-gray-900 rounded p-4 text-center">
              <p className="text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="bg-gray-900 rounded p-4 text-center">
              <p className="text-sm">Completed</p>
              <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
            </div>
            <div className="bg-gray-900 rounded p-4 text-center">
              <p className="text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {['high', 'medium', 'low'].map(priority => (
              <div key={priority} className="bg-gray-900 rounded p-4">
                <h2 className={`text-lg font-semibold mb-4 ${
                  priority === 'high' ? 'text-red-400' : 
                  priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                </h2>
                {filterTasksByPriority(priority).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No {priority} priority tasks</p>
                ) : (
                  filterTasksByPriority(priority).map(task => (
                    <TaskCard key={task._id} task={task} />
                  ))
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}