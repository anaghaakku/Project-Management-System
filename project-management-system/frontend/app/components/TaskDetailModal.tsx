'use client';

import { useState } from 'react';
import api from '@/app/api/axios';

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

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onStatusUpdate: () => void;
}

export default function TaskDetailModal({ isOpen, onClose, task, onStatusUpdate }: TaskDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🔄';
      default:
        return '⏳';
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/tasks/${task.id}/status`, { status: newStatus });
      onStatusUpdate();
      onClose();
    } catch (err) {
      setError('Failed to update task status. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📋 Task Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Title</label>
            <p className="text-lg font-semibold text-gray-800 mt-1">{task.title}</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
            <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
              {task.description || 'No description provided'}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</label>
            <div className="mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border inline-block ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)} {task.status === 'in_progress' ? 'In Progress' : task.status}
              </span>
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Project</label>
            <p className="text-gray-700 mt-1">Project #{task.project_id}</p>
          </div>

          {/* Assigned To */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</label>
            <p className="text-gray-700 mt-1">User #{task.assigned_to}</p>
          </div>

          {/* Created At */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</label>
            <p className="text-gray-700 mt-1 text-sm">
              {new Date(task.created_at).toLocaleString()}
            </p>
          </div>

          {/* Updated At */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</label>
            <p className="text-gray-700 mt-1 text-sm">
              {new Date(task.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* ✅ Status Update Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {task.status !== 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
                >
                  ⏳ Set Pending
                </button>
              )}
              {task.status !== 'in_progress' && (
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all font-medium disabled:opacity-50"
                >
                  🔄 In Progress
                </button>
              )}
              {task.status !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium disabled:opacity-50"
                >
                  {loading ? 'Updating...' : '✅ Complete'}
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}