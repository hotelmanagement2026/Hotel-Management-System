import mongoose from 'mongoose';
import 'dotenv/config';
import Room from '../models/Room.js';

// Static room data from frontend
const rooms = [
    {
        name: 'Royal Ocean Suite',
        price: 1200,
        description: 'Experience unparalleled luxury in our Royal Ocean Suite. Featuring panoramic ocean views, a private terrace, and bespoke furniture crafted by Italian artisans.',
        capacity: 2,
        amenities: ['Ocean View', 'King Size Bed', 'Private Pool', 'Butler Service', 'Spa Access'],
        images: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop'
        ],
        isAvailable: true
    },
    {
        name: 'Presidential Penthouse',
        price: 3500,
        description: 'The epitome of grandeur. The Presidential Penthouse offers a 360-degree view of the city skyline, a grand piano, and a private dining hall for up to 10 guests.',
        capacity: 4,
        amenities: ['City View', 'Private Elevator', 'Grand Piano', 'Chef on Call', 'Jacuzzi'],
        images: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop'
        ],
        isAvailable: true
    },
    {
        name: 'Garden Deluxe',
        price: 650,
        description: 'A serene escape surrounded by lush tropical gardens. The Garden Deluxe room features floor-to-ceiling windows and an outdoor rain shower.',
        capacity: 2,
        amenities: ['Garden View', 'Rain Shower', 'Organic Toiletries', 'Yoga Mat'],
        images: [
            'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=1974&auto=format&fit=crop'
        ],
        isAvailable: true
    },
    {
        name: 'Grand Executive',
        price: 850,
        description: 'Designed for the modern traveler. Smart room technology, a dedicated workspace, and access to the Executive Lounge make this perfect for business and leisure.',
        capacity: 2,
        amenities: ['Lounge Access', 'Smart TV', 'High-Speed Wi-Fi', 'Minibar'],
        images: [
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1609946895394-4340d2871f3a?q=80&w=2070&auto=format&fit=crop'
        ],
        isAvailable: true
    },
    {
        name: 'Lagoon Villa',
        price: 1500,
        description: 'Direct access to the crystal clear lagoon. This overwater villa offers privacy, romance, and an unforgettable sunrise view from your bed.',
        capacity: 2,
        amenities: ['Lagoon Access', 'Glass Floor', 'Infinity Plunge Pool', 'Champagne Breakfast'],
        images: [
            'https://images.unsplash.com/photo-1439066615861-d1fb8bc3adc5?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop'
        ],
        isAvailable: true
    },
    {
        name: 'Imperial Family Suite',
        price: 1800,
        description: 'Spacious and safe for the whole family. Includes a separate kids room, gaming console, and babysitting services upon request.',
        capacity: 5,
        amenities: ['2 Bedrooms', 'Kitchenette', 'Gaming Console', 'Kids Club Access'],
        images: [
            'https://images.unsplash.com/photo-1596436807771-7f3d72223050?q=80&w=2074&auto=format&fit=crop'
        ],
        isAvailable: true
    }
];

const migrateRooms = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Drop the collection to remove old indexes
        try {
            await Room.collection.drop();
            console.log('🗑️  Dropped old rooms collection');
        } catch (err) {
            console.log('ℹ️  No existing collection to drop');
        }

        // Insert all rooms
        const result = await Room.insertMany(rooms);
        console.log(`✅ Successfully imported ${result.length} rooms`);

        // Display imported rooms
        console.log('\n📋 Imported Rooms:');
        result.forEach((room, index) => {
            console.log(`${index + 1}. ${room.name} - ₹${room.price} (${room.capacity} guests)`);
        });

        console.log('\n✨ Migration complete! Rooms are now available in the admin panel.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
};

migrateRooms();
