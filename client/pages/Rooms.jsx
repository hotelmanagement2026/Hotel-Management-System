import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import RoomCard from '../components/rooms/RoomCard';
import Button from '../components/ui/Button';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All');
    const [priceSort, setPriceSort] = useState('default');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const { data } = await api.get('/rooms');
            if (data.success) {
                setRooms(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = useMemo(() => {
        let result = [...rooms];
        if (filterType !== 'All') {
            result = result.filter(r => r.name.includes(filterType));
        }
        if (priceSort === 'asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (priceSort === 'desc') {
            result.sort((a, b) => b.price - a.price);
        }
        return result;
    }, [rooms, filterType, priceSort]);

    // Extract unique room types from room names
    const roomTypes = useMemo(() => {
        const types = new Set(['All']);
        rooms.forEach(room => {
            const words = room.name.split(' ');
            words.forEach(word => {
                if (['Suite', 'Deluxe', 'Standard', 'Penthouse', 'Premium', 'Executive'].includes(word)) {
                    types.add(word);
                }
            });
        });
        return Array.from(types);
    }, [rooms]);

    if (loading) {
        return (
            <div className="pt-24 min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="text-stone-400 text-lg">Loading rooms...</div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <div className="bg-dark-800 py-12 mb-12 border-b border-stone-800">
                <div className="container mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif text-stone-100 mb-4"
                    >
                        Accommodations
                    </motion.h1>
                    <p className="text-stone-400 max-w-2xl mx-auto">
                        Choose from our collection of exquisite rooms and suites, each designed to provide an atmosphere of relaxation and refinement.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 mb-16">
                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="flex flex-wrap justify-center gap-2">
                        {roomTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-6 py-2 text-sm uppercase tracking-widest transition-all duration-300 border ${filterType === type
                                    ? 'bg-gold-400 border-gold-400 text-dark-900'
                                    : 'bg-transparent border-stone-700 text-stone-400 hover:border-gold-400 hover:text-gold-400'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-stone-500 text-sm">Sort by Price:</span>
                        <select
                            value={priceSort}
                            onChange={(e) => setPriceSort(e.target.value)}
                            className="bg-dark-800 text-stone-300 border border-stone-700 px-4 py-2 focus:outline-none focus:border-gold-400 text-sm"
                        >
                            <option value="default">Featured</option>
                            <option value="asc">Low to High</option>
                            <option value="desc">High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRooms.map((room) => (
                        <RoomCard key={room._id} room={room} />
                    ))}
                </div>

                {filteredRooms.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-stone-500 text-lg">No rooms available at the moment.</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => { setFilterType('All'); setPriceSort('default'); }}
                        >
                            Reset Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rooms;
