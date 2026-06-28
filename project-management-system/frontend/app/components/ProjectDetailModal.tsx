'use client';

import { useState } from 'react';
import api from '@/app/api/axios';

interface Project {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated: () => void;
  isAdmin: boolean;
}

export default function ProjectDetailModal({ 
  isOpen, 
  onClose, 
  project, 
  onProjectUpdated,
  isAdmin 
}: ProjectDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
  });

  if (!isOpen || !project) return null;

  const handleEditClick = () => {
    setIsEditing(true);
    setEditData({
      name: project.name,
      description: project.description || '',
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/projects/${project.id}`, editData);
      onProjectUpdated();
      onClose();
    } catch (err) {
      setError('Failed to update project. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete project "${project.name}"?`)) return;
    
    setLoading(true);
    setError('');
    try {
      await api.delete(`/projects/${project.id}`);
      onProjectUpdated();
      onClose();
    } catch (err) {
      setError('Failed to delete project. Please try again.');
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
             Project Details
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

        {isEditing && isAdmin ? (
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-1 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : ' Save'}
              </button>
            </div>
          </div>
        ) : (

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
              <p className="text-lg font-semibold text-gray-800 mt-1">{project.name}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
              <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                {project.description || 'No description provided'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</label>
              <p className="text-gray-700 mt-1">User #{project.created_by}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</label>
              <p className="text-gray-700 mt-1 text-sm">
                {new Date(project.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</label>
              <p className="text-gray-700 mt-1 text-sm">
                {new Date(project.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={handleEditClick}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
                  >
                     Edit Project
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium disabled:opacity-50"
                  >
                     Delete
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}