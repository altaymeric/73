import React, { useState } from 'react';
import { User } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSave: (users: User[]) => void;
}

export default function UserManagement({ isOpen, onClose, users, onSave }: UserManagementProps) {
  const [editingUsers, setEditingUsers] = useState<User[]>(users);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    username: '',
    password: '',
    permissions: {
      add: false,
      edit: false,
      delete: false,
      changeStatus: false,
      manageCategories: false,
      manageUsers: false
    }
  });
  const { user: currentUser } = useAuth();

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) {
      alert('Kullanıcı adı ve şifre zorunludur');
      return;
    }

    const userExists = editingUsers.some(u => u.username === newUser.username);
    if (userExists) {
      alert('Bu kullanıcı adı zaten kullanılıyor');
      return;
    }

    setEditingUsers([
      ...editingUsers,
      {
        ...newUser,
        id: crypto.randomUUID()
      }
    ]);
    setShowAddUser(false);
    setNewUser({
      username: '',
      password: '',
      permissions: {
        add: false,
        edit: false,
        delete: false,
        changeStatus: false,
        manageCategories: false,
        manageUsers: false
      }
    });
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Kendi hesabınızı silemezsiniz');
      return;
    }
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setEditingUsers(editingUsers.filter(u => u.id !== userToDelete.id));
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
    }
  };

  const handleSave = () => {
    onSave(editingUsers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative z-50 w-full max-w-4xl transform bg-white rounded-lg shadow-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Kullanıcı Yönetimi</h3>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <button
                onClick={() => setShowAddUser(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Yeni Kullanıcı Ekle
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yetkiler</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {editingUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.permissions.add}
                              onChange={(e) => {
                                setEditingUsers(users.map(u => 
                                  u.id === user.id 
                                    ? { ...u, permissions: { ...u.permissions, add: e.target.checked } }
                                    : u
                                ));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Ekleme</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.permissions.edit}
                              onChange={(e) => {
                                setEditingUsers(users.map(u => 
                                  u.id === user.id 
                                    ? { ...u, permissions: { ...u.permissions, edit: e.target.checked } }
                                    : u
                                ));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Düzenleme</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.permissions.delete}
                              onChange={(e) => {
                                setEditingUsers(users.map(u => 
                                  u.id === user.id 
                                    ? { ...u, permissions: { ...u.permissions, delete: e.target.checked } }
                                    : u
                                ));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Silme</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.permissions.changeStatus}
                              onChange={(e) => {
                                setEditingUsers(users.map(u => 
                                  u.id === user.id 
                                    ? { ...u, permissions: { ...u.permissions, changeStatus: e.target.checked } }
                                    : u
                                ));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Durum Değiştirme</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.permissions.manageCategories}
                              onChange={(e) => {
                                setEditingUsers(users.map(u => 
                                  u.id === user.id 
                                    ? { ...u, permissions: { ...u.permissions, manageCategories: e.target.checked } }
                                    : u
                                ));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Kategori Yönetimi</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={user.permissions.manageUsers}
                              onChange={(e) => {
                                setEditingUsers(users.map(u => 
                                  u.id === user.id 
                                    ? { ...u, permissions: { ...u.permissions, manageUsers: e.target.checked } }
                                    : u
                                ));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              disabled={user.id === currentUser?.id}
                            />
                            <span className="ml-2 text-sm text-gray-600">Kullanıcı Yönetimi</span>
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                          disabled={user.id === currentUser?.id}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Yeni Kullanıcı Ekleme Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddUser(false)}></div>
            <div className="relative z-50 w-full max-w-md transform bg-white rounded-lg shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Yeni Kullanıcı Ekle</h3>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Şifre</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Yetkiler</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newUser.permissions.add}
                          onChange={(e) => setNewUser({
                            ...newUser,
                            permissions: { ...newUser.permissions, add: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Ekleme</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newUser.permissions.edit}
                          onChange={(e) => setNewUser({
                            ...newUser,
                            permissions: { ...newUser.permissions, edit: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Düzenleme</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newUser.permissions.delete}
                          onChange={(e) => setNewUser({
                            ...newUser,
                            permissions: { ...newUser.permissions, delete: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Silme</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newUser.permissions.changeStatus}
                          onChange={(e) => setNewUser({
                            ...newUser,
                            permissions: { ...newUser.permissions, changeStatus: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Durum Değiştirme</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newUser.permissions.manageCategories}
                          onChange={(e) => setNewUser({
                            ...newUser,
                            permissions: { ...newUser.permissions, manageCategories: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Kategori Yönetimi</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newUser.permissions.manageUsers}
                          onChange={(e) => setNewUser({
                            ...newUser,
                            permissions: { ...newUser.permissions, manageUsers: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Kullanıcı Yönetimi</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Kullanıcıyı Sil"
        message={
          <div>
            <p>Bu kullanıcıyı silmek istediğinizden emin misiniz?</p>
            {userToDelete && (
              <div className="mt-2 text-sm text-gray-500">
                <p>Kullanıcı Adı: {userToDelete.username}</p>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}