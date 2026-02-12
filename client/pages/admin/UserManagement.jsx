import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FaSearch, FaUserShield, FaTrash } from 'react-icons/fa';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');
    const [searchEmail, setSearchEmail] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, roleFilter, searchEmail]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (searchEmail) {
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(searchEmail.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const handleChangeRole = (user) => {
        setSelectedUser(user);
        setModalAction('changeRole');
        setShowModal(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setModalAction('delete');
        setShowModal(true);
    };

    const confirmAction = async () => {
        if (!selectedUser) return;

        try {
            if (modalAction === 'changeRole') {
                const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
                await api.put(`/admin/users/${selectedUser._id}/role`, { role: newRole });
            } else if (modalAction === 'delete') {
                await api.delete(`/admin/users/${selectedUser._id}`);
            }

            fetchUsers();
            setShowModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Action failed:', error);
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-stone-400">Loading users...</div>;
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-gold-400 mb-2">User Management</h1>
                <p className="text-stone-400">Manage all registered users</p>
            </div>

            {/* Filters */}
            <div className="bg-dark-800 p-6 rounded border border-stone-800 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role Filter */}
                    <div>
                        <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">Filter by Role</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-900 border border-stone-700 rounded text-stone-300 focus:border-gold-400 focus:outline-none"
                        >
                            <option value="all">All Users</option>
                            <option value="user">Users Only</option>
                            <option value="admin">Admins Only</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">Search by Email</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                placeholder="Enter email..."
                                className="w-full px-4 py-2 pl-10 bg-dark-900 border border-stone-700 rounded text-stone-300 focus:border-gold-400 focus:outline-none"
                            />
                            <FaSearch className="absolute left-3 top-3 text-stone-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-dark-800 rounded border border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Verified</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-dark-700 transition-colors">
                                        <td className="px-6 py-4 text-stone-300">{user.name}</td>
                                        <td className="px-6 py-4 text-stone-300">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded text-xs uppercase tracking-wider ${user.role === 'admin'
                                                    ? 'bg-gold-900 text-gold-300'
                                                    : 'bg-blue-900 text-blue-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded text-xs ${user.isAccountVerified
                                                    ? 'bg-green-900 text-green-300'
                                                    : 'bg-red-900 text-red-300'
                                                }`}>
                                                {user.isAccountVerified ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-stone-400 text-sm">
                                            {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleChangeRole(user)}
                                                    className="p-2 text-gold-400 hover:bg-gold-400 hover:text-dark-900 rounded transition-colors"
                                                    title="Change Role"
                                                >
                                                    <FaUserShield size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="p-2 text-red-400 hover:bg-red-400 hover:text-white rounded transition-colors"
                                                    title="Delete User"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-stone-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 border border-stone-700 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-serif text-gold-400 mb-4">
                            {modalAction === 'changeRole' ? 'Change User Role' : 'Delete User'}
                        </h3>
                        <p className="text-stone-300 mb-6">
                            {modalAction === 'changeRole'
                                ? `Change ${selectedUser.name}'s role from ${selectedUser.role} to ${selectedUser.role === 'admin' ? 'user' : 'admin'}?`
                                : `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`
                            }
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={confirmAction}
                                className={`flex-1 px-4 py-2 rounded font-medium ${modalAction === 'delete'
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-gold-400 hover:bg-gold-500 text-dark-900'
                                    }`}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
