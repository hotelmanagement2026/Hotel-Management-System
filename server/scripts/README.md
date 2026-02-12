# Server Utility Scripts

This folder contains standalone utility and migration scripts for database management and maintenance tasks.

## Database Inspection Scripts

### `check-db.js`
**Purpose**: Comprehensive database health check  
**Usage**: `node scripts/check-db.js`  
**What it does**:
- Connects to MongoDB
- Counts total transactions
- Shows transaction status distribution
- Displays sample transactions
- Lists total users and admin users

### `check-users.js`
**Purpose**: Quick user listing  
**Usage**: `node scripts/check-users.js`  
**What it does**:
- Lists all users with their name, email, and role
- Formatted console output

### `list-users.js`
**Purpose**: Detailed user listing (JSON format)  
**Usage**: `node scripts/list-users.js`  
**What it does**:
- Lists all users in JSON format
- Useful for debugging or exporting user data

### `find-user.js`
**Purpose**: Find specific user by ID  
**Usage**: `node scripts/find-user.js`  
**What it does**:
- Searches for a user by their MongoDB ObjectId
- Displays user details (name, email, role)
- **Note**: Edit the hardcoded user ID in the file before running

## User Management Scripts

### `promote-user.js`
**Purpose**: Promote a user to admin role  
**Usage**: `node scripts/promote-user.js`  
**What it does**:
- Updates a user's role to 'admin'
- **Note**: Edit the `emailToPromote` variable in the file before running

## Migration Scripts

### `migrate-status.js`
**Purpose**: Migrate transaction statuses  
**Usage**: `node scripts/migrate-status.js`  
**What it does**:
- Updates all transactions with status 'success' to 'verified'
- Shows count of modified records

### `migrateRooms.js`
**Purpose**: Seed room data into database  
**Usage**: `node scripts/migrateRooms.js`  
**What it does**:
- Drops existing rooms collection
- Inserts predefined luxury room data
- Displays imported rooms with details

### `setup-new-database.js`
**Purpose**: Complete database setup for new MongoDB instance  
**Usage**: `npm run db:setup` or `node scripts/setup-new-database.js`  
**What it does**:
- Clears existing collections (Users, Rooms, Transactions)
- Creates admin user (admin@lumiere.com / admin123)
- Creates sample user (user@example.com / user123)
- Inserts all 6 luxury room types
- Creates a sample booking transaction
- Displays setup summary with credentials

⚠️ **Warning**: This script will DELETE all existing data in the database!

## Important Notes

⚠️ **Before running any script**:
1. Ensure your `.env` file has the correct `MONGODB_URI`
2. Make sure MongoDB is running and accessible
3. For scripts with hardcoded values (like `find-user.js` or `promote-user.js`), edit the values first

💡 **Best Practices**:
- Run these scripts from the server root directory
- Always backup your database before running migration scripts
- Review the script code before execution to understand what it does
