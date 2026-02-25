import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FaFileInvoice, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const MyInvoices = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                // Refactored to use api instance
                const { data } = await api.get(`/invoices/user/${user._id}`);
                if (data.success) {
                    setInvoices(data.invoices);
                }
            } catch (error) {
                console.error('Failed to load invoices:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchInvoices();
    }, [user]);

    const handleDownload = async (invoiceId, invoiceNumber) => {
        try {
            // Refactored to use api instance with blob response
            const response = await api.get(`/invoices/${invoiceId}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Download failed');
        }
    };

    if (loading) return <div className="text-center py-8">Loading invoices...</div>;

    return (
        <div className="bg-dark-800 rounded-lg p-2">
            <h2 className="text-xl font-serif text-gold-400 mb-6 flex items-center gap-2">
                <FaFileInvoice /> My Invoices
            </h2>

            {invoices.length === 0 ? (
                <p className="text-stone-500 italic font-serif py-4">No exclusive invoices found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dark-900 text-stone-500 uppercase text-[10px] tracking-widest font-bold">
                            <tr>
                                <th className="p-4 border-b border-stone-800">Invoice #</th>
                                <th className="p-4 border-b border-stone-800">Date</th>
                                <th className="p-4 border-b border-stone-800">Amount</th>
                                <th className="p-4 border-b border-stone-800">Status</th>
                                <th className="p-4 border-b border-stone-800">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {invoices.map((inv) => (
                                <tr key={inv._id} className="hover:bg-dark-700 transition-colors">
                                    <td className="p-4 font-medium text-stone-200">{inv.invoiceNumber}</td>
                                    <td className="p-4 text-xs text-stone-400">
                                        {new Date(inv.issueDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-gold-400 font-bold">₹{inv.grandTotal.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider
                                            ${inv.paymentStatus === 'paid' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'}`}>
                                            {inv.paymentStatus.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDownload(inv._id, inv.invoiceNumber)}
                                            className="text-gold-400 hover:text-gold-300 flex items-center gap-1 text-xs font-medium transition-colors"
                                        >
                                            <FaDownload /> Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyInvoices;
