import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import api from '../../utils/api';

const SeasonalDiscountManagement = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        discountPercentage: '',
        startDate: '',
        endDate: '',
        priority: 0,
        applicableRoomTypes: [],
        description: '',
        isActive: true
    });
    const [formErrors, setFormErrors] = useState({});

    // Available room types - typically fetched from server, but hardcoded for now or adjust as needed
    const ROOM_TYPES = ['Deluxe', 'Executive', 'Suite', 'Presidential'];

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const { data } = await api.get('/seasonal-discounts');
            if (data.success && Array.isArray(data.data)) {
                setDiscounts(data.data);
            } else {
                console.warn('Invalid discounts data:', data);
                setDiscounts([]);
            }
        } catch (error) {
            console.error('Failed to fetch seasonal discounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.discountPercentage || formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
            errors.discountPercentage = 'Percentage must be between 1 and 100';
        }
        if (!formData.startDate) errors.startDate = 'Start date is required';
        if (!formData.endDate) errors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            errors.endDate = 'End date must be after start date';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const payload = {
                ...formData,
                discountPercentage: Number(formData.discountPercentage),
                priority: Number(formData.priority)
            };

            if (editingDiscount) {
                const { data } = await api.put(`/seasonal-discounts/${editingDiscount._id}`, payload);
                if (data.success) {
                    fetchDiscounts();
                    handleCloseModal();
                }
            } else {
                const { data } = await api.post('/seasonal-discounts', payload);
                if (data.success) {
                    fetchDiscounts();
                    handleCloseModal();
                }
            }
        } catch (error) {
            console.error('Failed to save seasonal discount:', error);
            alert(error.response?.data?.message || 'Failed to save seasonal discount');
        }
    };

    const handleEdit = (discount) => {
        setEditingDiscount(discount);
        setFormData({
            name: discount.name,
            discountPercentage: discount.discountPercentage,
            startDate: discount.startDate.split('T')[0],
            endDate: discount.endDate.split('T')[0],
            priority: discount.priority,
            applicableRoomTypes: discount.applicableRoomTypes || [],
            description: discount.description || '',
            isActive: discount.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await api.delete(`/seasonal-discounts/${id}`);
            if (data.success) {
                fetchDiscounts();
                setDeleteConfirm(null);
            }
        } catch (error) {
            console.error('Failed to delete seasonal discount:', error);
            alert('Failed to delete seasonal discount');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDiscount(null);
        setFormData({
            name: '',
            discountPercentage: '',
            startDate: '',
            endDate: '',
            priority: 0,
            applicableRoomTypes: [],
            description: '',
            isActive: true
        });
        setFormErrors({});
    };

    // Helper to toggle room types in selection
    const toggleRoomType = (type) => {
        setFormData(prev => {
            const current = prev.applicableRoomTypes;
            if (current.includes(type)) {
                return { ...prev, applicableRoomTypes: current.filter(t => t !== type) };
            } else {
                return { ...prev, applicableRoomTypes: [...current, type] };
            }
        });
    };

    const isRoomTypeSelected = (type) => formData.applicableRoomTypes.length === 0 || formData.applicableRoomTypes.includes(type);

    const isExpired = (endDate) => new Date(endDate) < new Date();

    if (loading) return <div className="text-center py-12 text-stone-400">Loading seasonal discounts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif text-stone-100">Seasonal Discounts</h1>
                    <p className="text-stone-400 mt-1">Manage automatic seasonal pricing adjustments</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gold-400 text-dark-900 font-medium hover:bg-gold-500 transition-colors"
                >
                    <FaPlus /> <span>Create Discount</span>
                </button>
            </div>

            <div className="bg-dark-800 border border-stone-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-900 border-b border-stone-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Date Range</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-700">
                            {discounts.map((discount) => (
                                <tr key={discount._id} className="hover:bg-dark-700 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-stone-100">{discount.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gold-400 font-bold">
                                        {discount.discountPercentage}%
                                    </td>
                                    <td className="px-6 py-4 text-stone-300 text-sm">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-stone-500" />
                                            <span>{new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-stone-300">
                                        {discount.priority}
                                    </td>
                                    <td className="px-6 py-4">
                                        {!discount.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-700 text-stone-400 text-xs rounded"><FaTimesCircle /> Inactive</span>
                                        ) : isExpired(discount.endDate) ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded"><FaTimesCircle /> Expired</span>
                                        ) : new Date(discount.startDate) > new Date() ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded"><FaClock /> Scheduled</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded"><FaCheckCircle /> Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(discount)} className="p-2 text-blue-400 hover:bg-blue-900/20 transition-colors rounded" title="Edit"><FaEdit /></button>
                                            <button onClick={() => setDeleteConfirm(discount)} className="p-2 text-red-400 hover:bg-red-900/20 transition-colors rounded" title="Delete"><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {discounts.length === 0 && <div className="text-center py-12 text-stone-500">No seasonal discounts found.</div>}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-dark-800 border border-stone-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-dark-800 border-b border-stone-700 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-2xl font-serif text-stone-100">{editingDiscount ? 'Edit Seasonal Discount' : 'Create Seasonal Discount'}</h2>
                                <button onClick={handleCloseModal} className="text-stone-400 hover:text-stone-100"><FaTimes size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-300 mb-2">Name <span className="text-red-400">*</span></label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-stone-700 text-stone-100 focus:border-gold-400 focus:outline-none" placeholder="Summer Sale" />
                                    {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-300 mb-2">Discount % <span className="text-red-400">*</span></label>
                                        <input type="number" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-stone-700 text-stone-100 focus:border-gold-400 focus:outline-none" placeholder="10" />
                                        {formErrors.discountPercentage && <p className="text-red-400 text-xs mt-1">{formErrors.discountPercentage}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-300 mb-2">Priority</label>
                                        <input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-stone-700 text-stone-100 focus:border-gold-400 focus:outline-none" placeholder="0" />
                                        <span className="text-xs text-stone-500">Higher priority overrides lower priority on overlapping dates.</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-300 mb-2">Start Date <span className="text-red-400">*</span></label>
                                        <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-stone-700 text-stone-100 focus:border-gold-400 focus:outline-none" />
                                        {formErrors.startDate && <p className="text-red-400 text-xs mt-1">{formErrors.startDate}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-300 mb-2">End Date <span className="text-red-400">*</span></label>
                                        <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-stone-700 text-stone-100 focus:border-gold-400 focus:outline-none" />
                                        {formErrors.endDate && <p className="text-red-400 text-xs mt-1">{formErrors.endDate}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-300 mb-2">Applicable Room Types (Select all if none selected)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ROOM_TYPES.map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => toggleRoomType(type)}
                                                className={`px-3 py-1 rounded text-sm border transition-colors ${formData.applicableRoomTypes.includes(type)
                                                    ? 'bg-gold-500 text-dark-900 border-gold-500 font-medium'
                                                    : 'bg-dark-900 text-stone-400 border-stone-700 hover:border-gold-500/50'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-300 mb-2">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-stone-700 text-stone-100 focus:border-gold-400 focus:outline-none" rows="2" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-gold-400 bg-dark-900 border-stone-700 focus:ring-gold-400" />
                                    <label htmlFor="isActive" className="text-sm text-stone-300">Active</label>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-stone-700">
                                    <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 bg-stone-700 text-stone-100 hover:bg-stone-600 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-gold-400 text-dark-900 font-medium hover:bg-gold-500 transition-colors">{editingDiscount ? 'Update' : 'Create'} Discount</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-dark-800 border border-stone-700 p-6 max-w-md w-full">
                            <h3 className="text-xl font-serif text-stone-100 mb-4">Confirm Delete</h3>
                            <p className="text-stone-400 mb-6">Are you sure you want to delete <span className="font-bold text-gold-400">{deleteConfirm.name}</span>?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-stone-700 text-stone-100 hover:bg-stone-600 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SeasonalDiscountManagement;
