'use client';

import TaskModal from '@/app/components/TaskModal';
import TaskDetailModal from '@/app/components/TaskDetailModal';
import ProjectDetailModal from '@/app/components/ProjectDetailModal';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/api/axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  project_id: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProjectDetailModalOpen, setIsProjectDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      
      const [projectsRes, tasksRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks'),
      ]);

      let projectsData = [];
      const projectsResponse = projectsRes.data;
      if (Array.isArray(projectsResponse)) {
        projectsData = projectsResponse;
      } else if (projectsResponse && projectsResponse.data && Array.isArray(projectsResponse.data)) {
        projectsData = projectsResponse.data;
      } else {
        projectsData = [];
      }
      setProjects(projectsData);

      let tasksData = [];
      const tasksResponse = tasksRes.data;
      if (Array.isArray(tasksResponse)) {
        tasksData = tasksResponse;
      } else if (tasksResponse && tasksResponse.data && Array.isArray(tasksResponse.data)) {
        tasksData = tasksResponse.data;
      } else {
        tasksData = [];
      }

      if (user?.role !== 'admin' && user?.id) {
        tasksData = tasksData.filter((task: Task) => task.assigned_to === user.id);
      }

      setTasks(tasksData);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setProjects([]);
      setTasks([]);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => router.push('/login'), 2000);
      } else if (error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:8080');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    fetchData();
  };

  const handleStatusUpdate = () => {
    fetchData();
  };

  const handleProjectUpdated = () => {
    fetchData();
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDetailModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const openTaskModal = () => {
    console.log('Opening task modal...');
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const completedTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'completed').length : 0;
  const pendingTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'pending').length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Something Went Wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const projectsList = Array.isArray(projects) ? projects : [];
  const tasksList = Array.isArray(tasks) ? tasks : [];
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">PM</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Project Management
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Manage your projects and tasks efficiently</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a href="/dashboard" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-all">
                Dashboard
              </a>
              {isAdmin && (
                <>
                  <a href="/employees" className="text-sm text-gray-600 hover:text-indigo-600 transition-all">
                    Employees
                  </a>
                  <a href="/admin" className="text-sm text-gray-600 hover:text-indigo-600 transition-all">
                    Admin
                  </a>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 bg-gray-100/80 px-4 py-2 rounded-full border border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-indigo-100 mt-1">Here's what's happening with your projects today</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Projects</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{projectsList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{tasksList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{completedTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{pendingTasks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Projects
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {projectsList.length}
                </span>
              </h3>
              {isAdmin && (
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all">
                  + New Project
                </button>
              )}
            </div>
            {projectsList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-gray-500">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {projectsList.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleProjectClick(p)}
                    className="group bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{p.description}</p>
                        <p className="text-xs text-gray-400 mt-1">Click to view details</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : p.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {p.status === 'completed' ? 'Completed' : p.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Tasks
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {tasksList.length}
                </span>
              </h3>
              {isAdmin ? (
                <button
                  onClick={openTaskModal}
                  className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  + New Task
                </button>
              ) : null}
            </div>
            {tasksList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {tasksList.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleTaskClick(t)}
                    className="group flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                          {t.title}
                        </p>
                        <p className="text-xs text-gray-400">Click to view details</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(t.status)}`}
                    >
                      {t.status === 'in_progress' ? 'In Progress' : t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400 border-t border-gray-200/50 pt-6">
          © 2026 Project Management System. Built with using Next.js & Go
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Closing task modal...');
          setIsModalOpen(false);
        }}
        onTaskCreated={handleTaskCreated}
      />

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={selectedTask}
        onStatusUpdate={handleStatusUpdate}
      />

      <ProjectDetailModal
        isOpen={isProjectDetailModalOpen}
        onClose={() => setIsProjectDetailModalOpen(false)}
        project={selectedProject}
        onProjectUpdated={handleProjectUpdated}
        isAdmin={isAdmin}
      />
    </div>
  );
}