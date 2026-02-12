import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        capacity: '',
        amenities: '',
        images: '',
        isAvailable: true
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const { data } = await api.get('/rooms/admin/all');
            if (data.success) {
                setRooms(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const roomData = {
            ...formData,
            price: Number(formData.price),
            capacity: Number(formData.capacity),
            amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
            images: formData.images.split(',').map(i => i.trim()).filter(i => i)
        };

        try {
            if (editingRoom) {
                await api.put(`/rooms/${editingRoom._id}`, roomData);
            } else {
                await api.post('/rooms', roomData);
            }

            fetchRooms();
            closeModal();
        } catch (error) {
            console.error('Failed to save room:', error);
            alert('Failed to save room');
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            name: room.name,
            description: room.description || '',
            price: room.price,
            capacity: room.capacity,
            amenities: room.amenities.join(', '),
            images: room.images.join(', '),
            isAvailable: room.isAvailable
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;

        try {
            await api.delete(`/rooms/${id}`);
            fetchRooms();
        } catch (error) {
            console.error('Failed to delete room:', error);
            alert('Failed to delete room');
        }
    };

    const toggleAvailability = async (room) => {
        try {
            await api.put(`/rooms/${room._id}`, {
                ...room,
                isAvailable: !room.isAvailable
            });
            fetchRooms();
        } catch (error) {
            console.error('Failed to toggle availability:', error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRoom(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            capacity: '',
            amenities: '',
            images: '',
            isAvailable: true
        });
    };

    if (loading) {
        return <div className="p-8 text-center text-stone-400">Loading rooms...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-gold-400 mb-2">Room Management</h1>
                    <p className="text-stone-400">Manage hotel rooms and availability</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-gold-400 text-dark-900 font-medium rounded hover:bg-gold-500 transition-colors uppercase text-sm tracking-widest"
                >
                    Add New Room
                </button>
            </div>

            {/* Rooms Table */}
            <div className="bg-dark-800 rounded border border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dark-700">
                            <tr className="border-b border-stone-800">
                                <th className="p-4 text-stone-400 text-sm uppercase tracking-wider">Name</th>
                                <th className="p-4 text-stone-400 text-sm uppercase tracking-wider">Price</th>
                                <th className="p-4 text-stone-400 text-sm uppercase tracking-wider">Capacity</th>
                                <th className="p-4 text-stone-400 text-sm uppercase tracking-wider">Amenities</th>
                                <th className="p-4 text-stone-400 text-sm uppercase tracking-wider">Status</th>
                                <th className="p-4 text-stone-400 text-sm uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.length > 0 ? (
                                rooms.map((room) => (
                                    <tr key={room._id} className="border-b border-stone-800 hover:bg-dark-700 transition-colors">
                                        <td className="p-4 text-stone-300 font-medium">{room.name}</td>
                                        <td className="p-4 text-stone-300">₹{room.price.toLocaleString()}</td>
                                        <td className="p-4 text-stone-300">{room.capacity} guests</td>
                                        <td className="p-4 text-stone-300 text-sm">
                                            {room.amenities.slice(0, 2).join(', ')}
                                            {room.amenities.length > 2 && ` +${room.amenities.length - 2}`}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleAvailability(room)}
                                                className={`px-3 py-1 rounded text-xs uppercase tracking-wider ${room.isAvailable
                                                        ? 'bg-green-900 text-green-300'
                                                        : 'bg-red-900 text-red-300'
                                                    }`}
                                            >
                                                {room.isAvailable ? 'Available' : 'Unavailable'}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(room)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(room._id)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-stone-500">
                                        No rooms found. Click "Add New Room" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 rounded-lg border border-stone-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-stone-800">
                            <h2 className="text-2xl font-serif text-gold-400">
                                {editingRoom ? 'Edit Room' : 'Add New Room'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-stone-400 text-sm mb-2">Room Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-dark-700 border border-stone-700 rounded text-stone-200 focus:outline-none focus:border-gold-400"
                                    placeholder="e.g., Deluxe Suite"
                                />
                            </div>

                            <div>
                                <label className="block text-stone-400 text-sm mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-dark-700 border border-stone-700 rounded text-stone-200 focus:outline-none focus:border-gold-400"
                                    placeholder="Room description..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-stone-400 text-sm mb-2">Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 bg-dark-700 border border-stone-700 rounded text-stone-200 focus:outline-none focus:border-gold-400"
                                        placeholder="5000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-stone-400 text-sm mb-2">Capacity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        className="w-full px-4 py-2 bg-dark-700 border border-stone-700 rounded text-stone-200 focus:outline-none focus:border-gold-400"
                                        placeholder="2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-stone-400 text-sm mb-2">Amenities (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.amenities}
                                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                                    className="w-full px-4 py-2 bg-dark-700 border border-stone-700 rounded text-stone-200 focus:outline-none focus:border-gold-400"
                                    placeholder="WiFi, TV, AC, Mini Bar"
                                />
                            </div>

                            <div>
                                <label className="block text-stone-400 text-sm mb-2">Image URLs (comma-separated)</label>
                                <textarea
                                    value={formData.images}
                                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                    rows="2"
                                    className="w-full px-4 py-2 bg-dark-700 border border-stone-700 rounded text-stone-200 focus:outline-none focus:border-gold-400"
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isAvailable" className="text-stone-400 text-sm">
                                    Room is available
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-2 bg-gold-400 text-dark-900 font-medium rounded hover:bg-gold-500 transition-colors uppercase text-sm tracking-widest"
                                >
                                    {editingRoom ? 'Update Room' : 'Create Room'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-2 bg-stone-700 text-stone-300 font-medium rounded hover:bg-stone-600 transition-colors uppercase text-sm tracking-widest"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
