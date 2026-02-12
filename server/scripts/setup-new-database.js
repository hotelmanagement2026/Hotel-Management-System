import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import Room from '../models/Room.js';
import Transaction from '../models/Transaction.js';

const normalizeEnv = (value) => {
    if (!value) return value;
    return value.trim().replace(/^['"]+|['"]+$/g, '');
};

// Sample room data
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

const setupNewDatabase = async () => {
    try {
        const mongoUri = normalizeEnv(process.env.MONGODB_URI);
        console.log('🔌 Connecting to new MongoDB database...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Step 1: Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing collections...');
        await userModel.deleteMany({});
        await Room.deleteMany({});
        await Transaction.deleteMany({});
        console.log('✅ Collections cleared\n');

        // Step 2: Create Admin User
        console.log('👤 Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await userModel.create({
            name: 'Admin User',
            email: 'admin@lumiere.com',
            password: hashedPassword,
            role: 'admin',
            isAccountVerified: true
        });
        console.log(`✅ Admin created: ${adminUser.email} (password: admin123)\n`);

        // Step 3: Create Sample Regular User
        console.log('👤 Creating sample user...');
        const userPassword = await bcrypt.hash('user123', 10);
        const sampleUser = await userModel.create({
            name: 'John Doe',
            email: 'user@example.com',
            password: userPassword,
            role: 'user',
            isAccountVerified: true
        });
        console.log(`✅ User created: ${sampleUser.email} (password: user123)\n`);

        // Step 4: Insert Rooms
        console.log('🏨 Creating rooms...');
        const createdRooms = await Room.insertMany(rooms);
        console.log(`✅ Successfully created ${createdRooms.length} rooms:\n`);
        createdRooms.forEach((room, index) => {
            console.log(`   ${index + 1}. ${room.name} - ₹${room.price} (${room.capacity} guests)`);
        });
        console.log('');

        // Step 5: Create Sample Transaction (optional)
        console.log('💳 Creating sample transaction...');
        const sampleTransaction = await Transaction.create({
            bookingId: 'BK' + Date.now(),
            userId: sampleUser._id.toString(),
            roomId: createdRooms[0]._id.toString(),
            roomName: createdRooms[0].name,
            amount: createdRooms[0].price * 2, // 2 nights
            currency: 'INR',
            orderId: 'order_' + Date.now(),
            paymentId: 'pay_' + Date.now(),
            status: 'verified',
            bookingStatus: 'confirmed',
            checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            checkOut: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        });
        console.log(`✅ Sample booking created: ${sampleTransaction.bookingId}\n`);

        // Step 6: Display Summary
        console.log('📊 DATABASE SETUP SUMMARY');
        console.log('═══════════════════════════════════════');
        console.log(`✅ Users: ${await userModel.countDocuments()}`);
        console.log(`✅ Rooms: ${await Room.countDocuments()}`);
        console.log(`✅ Transactions: ${await Transaction.countDocuments()}`);
        console.log('═══════════════════════════════════════\n');

        console.log('🎉 Database setup complete!');
        console.log('\n📝 LOGIN CREDENTIALS:');
        console.log('   Admin: admin@lumiere.com / admin123');
        console.log('   User:  user@example.com / user123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
};

setupNewDatabase();
