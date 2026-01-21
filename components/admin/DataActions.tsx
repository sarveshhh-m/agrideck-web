'use client';

import { useState, useCallback } from 'react';
import { X, Save, Trash2, Edit, Plus } from 'lucide-react';
import { useDataMutation } from '@/lib/admin/useDataMutation';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface DataModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  table: string;
  data?: T;
  onSuccess: () => void;
}

export function DataModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  table,
  data,
  onSuccess,
}: DataModalProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>(data || {});
  const { mutate, loading } = useDataMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const type = data ? 'update' : 'insert';
      const id = data?.id;
      await mutate(type, table, formData as any, id as any);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const editableFields = Object.entries(data || {}).filter(([key]) => 
    key !== 'id' && key !== 'created_at' && key !== 'updated_at'
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={data ? 'Edit' : 'Create'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {editableFields.length > 0 ? editableFields.map(([key, value]) => {
          const fieldType = typeof value;

          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              {fieldType === 'boolean' ? (
                <input
                  type="checkbox"
                  checked={Boolean(formData[key as keyof T] as boolean)}
                  onChange={e => handleChange(key, e.target.checked)}
                  className="rounded border-gray-300"
                />
              ) : (
                <input
                  type={fieldType === 'number' ? 'number' : 'text'}
                  value={String(formData[key as keyof T] || '')}
                  onChange={e => handleChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          );
        }) : (
          <div className="text-gray-500">No editable fields available</div>
        )}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface DataActionsProps<T> {
  table: string;
  data: T;
  onRefresh: () => void;
}

export function DataActions<T extends Record<string, any> & { id?: string | number }>({ 
  table, 
  data, 
  onRefresh 
}: DataActionsProps<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  const { mutate: deleteMutate, loading: deleteLoading } = useDataMutation();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteMutate('delete', table, undefined, data.id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Error deleting data');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setModalOpen(true)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteLoading}
          className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <DataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        table={table}
        data={data}
        onSuccess={onRefresh}
      />
    </>
  );
}

interface CreateButtonProps {
  table: string;
  onSuccess: () => void;
}

export function CreateButton({ table, onSuccess }: CreateButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create New
      </button>
      <DataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        table={table}
        onSuccess={onSuccess}
      />
    </>
  );
}
