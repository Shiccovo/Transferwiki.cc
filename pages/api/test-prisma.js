import { userOperations } from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Try to query the User model using our database layer
    const users = await userOperations.getAllUsers();
    const limitedUsers = users.slice(0, 5);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Supabase connection is working correctly!',
      users: limitedUsers.length
    });
  } catch (error) {
    console.error('Database test error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Database connection error',
      error: error.message 
    });
  }
}