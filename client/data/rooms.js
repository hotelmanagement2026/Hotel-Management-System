export const rooms = [
    {
        id: '1',
        name: 'Royal Ocean Suite',
        price: 1200,
        rating: 5.0,
        description: 'Experience unparalleled luxury in our Royal Ocean Suite. Featuring panoramic ocean views, a private terrace, and bespoke furniture crafted by Italian artisans.',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop'
        ],
        type: 'Suite',
        amenities: ['Ocean View', 'King Size Bed', 'Private Pool', 'Butler Service', 'Spa Access'],
        maxGuests: 2,
        size: '120 sqm'
    },
    {
        id: '2',
        name: 'Presidential Penthouse',
        price: 3500,
        rating: 5.0,
        description: 'The epitome of grandeur. The Presidential Penthouse offers a 360-degree view of the city skyline, a grand piano, and a private dining hall for up to 10 guests.',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop'
        ],
        type: 'Penthouse',
        amenities: ['City View', 'Private Elevator', 'Grand Piano', 'Chef on Call', 'Jacuzzi'],
        maxGuests: 4,
        size: '350 sqm'
    },
    {
        id: '3',
        name: 'Garden Deluxe',
        price: 650,
        rating: 4.8,
        description: 'A serene escape surrounded by lush tropical gardens. The Garden Deluxe room features floor-to-ceiling windows and an outdoor rain shower.',
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=1974&auto=format&fit=crop'
        ],
        type: 'Deluxe',
        amenities: ['Garden View', 'Rain Shower', 'Organic Toiletries', 'Yoga Mat'],
        maxGuests: 2,
        size: '55 sqm'
    },
    {
        id: '4',
        name: 'Grand Executive',
        price: 850,
        rating: 4.9,
        description: 'Designed for the modern traveler. Smart room technology, a dedicated workspace, and access to the Executive Lounge make this perfect for business and leisure.',
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1609946895394-4340d2871f3a?q=80&w=2070&auto=format&fit=crop'
        ],
        type: 'Standard',
        amenities: ['Lounge Access', 'Smart TV', 'High-Speed Wi-Fi', 'Minibar'],
        maxGuests: 2,
        size: '60 sqm'
    },
    {
        id: '5',
        name: 'Lagoon Villa',
        price: 1500,
        rating: 5.0,
        description: 'Direct access to the crystal clear lagoon. This overwater villa offers privacy, romance, and an unforgettable sunrise view from your bed.',
        image: 'https://images.unsplash.com/photo-1439066615861-d1fb8bc3adc5?q=80&w=2070&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1439066615861-d1fb8bc3adc5?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop'
        ],
        type: 'Suite',
        amenities: ['Lagoon Access', 'Glass Floor', 'Infinity Plunge Pool', 'Champagne Breakfast'],
        maxGuests: 2,
        size: '100 sqm'
    },
    {
        id: '6',
        name: 'Imperial Family Suite',
        price: 1800,
        rating: 4.9,
        description: 'Spacious and safe for the whole family. Includes a separate kids room, gaming console, and babysitting services upon request.',
        image: 'https://images.unsplash.com/photo-1596436807771-7f3d72223050?q=80&w=2074&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1596436807771-7f3d72223050?q=80&w=2074&auto=format&fit=crop'
        ],
        type: 'Suite',
        amenities: ['2 Bedrooms', 'Kitchenette', 'Gaming Console', 'Kids Club Access'],
        maxGuests: 5,
        size: '150 sqm'
    }
];
