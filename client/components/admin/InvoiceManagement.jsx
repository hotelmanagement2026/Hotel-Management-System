import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaFileInvoice, FaDownload, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const InvoiceManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            // Refactored to use api instance
            const { data } = await api.get('/invoices', {
                params: { page, limit: 10, search, status: statusFilter }
            });
            if (data.success) {
                setInvoices(data.invoices);
                setTotalPages(data.pages);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchInvoices();
        }, 500);
        return () => clearTimeout(debounce);
    }, [search, statusFilter, page]);

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

    return (
        <div className="p-6 bg-dark-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-serif text-gold-400 flex items-center gap-2">
                    <FaFileInvoice /> Invoice Management
                </h1>
            </div>

            {/* Filters */}
            <div className="bg-dark-800 border border-stone-800 p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <FaSearch className="absolute left-3 top-3 text-stone-500" />
                    <input
                        type="text"
                        placeholder="Search by Invoice # or Guest Name..."
                        className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-stone-800 rounded-lg text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <FaFilter className="absolute left-3 top-3 text-stone-500" />
                    <select
                        className="pl-10 pr-8 py-2 bg-dark-900 border border-stone-800 rounded-lg text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 appearance-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="void">Void</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-dark-800 border border-stone-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-dark-900 text-stone-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-4 border-b border-stone-800">Invoice #</th>
                            <th className="p-4 border-b border-stone-800">Date</th>
                            <th className="p-4 border-b border-stone-800">Guest</th>
                            <th className="p-4 border-b border-stone-800">Amount</th>
                            <th className="p-4 border-b border-stone-800">Status</th>
                            <th className="p-4 border-b border-stone-800 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 text-stone-300">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-stone-500">
                                    Loading invoices...
                                </td>
                            </tr>
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-stone-500 font-serif italic">
                                    No invoices found.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr key={invoice._id} className="hover:bg-dark-700 transition-colors">
                                    <td className="p-4 font-medium text-stone-100">{invoice.invoiceNumber}</td>
                                    <td className="p-4 text-stone-400">
                                        {new Date(invoice.issueDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-medium text-stone-200">{invoice.customerDetails.name}</div>
                                        <div className="text-xs text-stone-500">{invoice.customerDetails.email}</div>
                                    </td>
                                    <td className="p-4 font-medium text-gold-400">₹{invoice.grandTotal.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider
                                            ${invoice.paymentStatus === 'paid' ? 'bg-green-900/40 text-green-400 border border-green-800' :
                                                invoice.paymentStatus === 'pending' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800' :
                                                    'bg-red-900/40 text-red-400 border border-red-800'}`}>
                                            {invoice.paymentStatus ? invoice.paymentStatus.toUpperCase() : 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)}
                                                className="p-2 text-gold-400 hover:bg-gold-500/10 rounded-full transition-colors"
                                                title="Download PDF"
                                            >
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 bg-dark-800 border border-stone-800 rounded-lg text-stone-400 disabled:opacity-30 hover:bg-dark-700 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-stone-500 font-serif">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 bg-dark-800 border border-stone-800 rounded-lg text-stone-400 disabled:opacity-30 hover:bg-dark-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default InvoiceManagement;
