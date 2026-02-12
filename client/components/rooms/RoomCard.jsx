import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const RoomCard = ({ room }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-dark-800 overflow-hidden border border-stone-800 hover:border-gold-400/30 transition-colors duration-500"
        >
            <div className="relative h-64 overflow-hidden">
                <motion.img
                    src={room.images && room.images[0] ? room.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
            </div>

            <div className="p-6 relative">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-serif text-stone-100 mb-1">{room.name}</h3>
                        <p className="text-stone-500 text-xs uppercase tracking-wider">
                            {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
                        </p>
                    </div>
                    <p className="text-right">
                        <span className="block text-lg font-bold text-gold-400">₹{room.price.toLocaleString()}</span>
                        <span className="text-xs text-stone-500 uppercase tracking-wider">/ Night</span>
                    </p>
                </div>

                <p className="text-stone-400 text-sm mb-6 line-clamp-2">
                    {room.description || 'Luxurious accommodation with premium amenities'}
                </p>

                <div className="flex items-center justify-between border-t border-stone-800 pt-4">
                    <span className="text-xs text-stone-500 uppercase tracking-widest">
                        {room.amenities && room.amenities.length > 0
                            ? `${room.amenities.length} Amenities`
                            : 'Premium Room'}
                    </span>
                    <Link to={`/rooms/${room._id}`}>
                        <Button variant="outline" className="px-6 py-2 text-xs">
                            Details
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default RoomCard;
