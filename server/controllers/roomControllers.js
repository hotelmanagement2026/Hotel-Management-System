import Room from '../models/Room.js';

// Admin: Create new room
export const createRoom = async (req, res) => {
    try {
        const { name, description, price, capacity, amenities, images } = req.body;

        if (!name || !price || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and capacity are required'
            });
        }

        const room = new Room({
            name,
            description,
            price,
            capacity,
            amenities: amenities || [],
            images: images || [],
            isAvailable: true
        });

        await room.save();

        return res.status(201).json({
            success: true,
            message: 'Room created successfully',
            data: room
        });
    } catch (error) {
        console.error('Create room error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create room'
        });
    }
};

// Admin: Update room
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, capacity, amenities, images, isAvailable } = req.body;

        const room = await Room.findByIdAndUpdate(
            id,
            { name, description, price, capacity, amenities, images, isAvailable },
            { new: true, runValidators: true }
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Room updated successfully',
            data: room
        });
    } catch (error) {
        console.error('Update room error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update room'
        });
    }
};

// Admin: Delete room
export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await Room.findByIdAndDelete(id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Delete room error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete room'
        });
    }
};

// Admin: Get all rooms (including unavailable)
export const getAllRoomsAdmin = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        console.error('Get all rooms error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch rooms'
        });
    }
};

// Public: Get all available rooms
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isAvailable: true }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        console.error('Get available rooms error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch rooms'
        });
    }
};

// Public: Get single room by ID
export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // For public access, only return if available
        if (!room.isAvailable) {
            return res.status(404).json({
                success: false,
                message: 'Room not available'
            });
        }

        return res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Get room by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch room'
        });
    }
};
