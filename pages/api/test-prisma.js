import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  try {
    // Try to query the User model
    const users = await prisma.user.findMany({
      take: 5,
    });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Prisma is working correctly!',
      users: users.length
    });
  } catch (error) {
    console.error('Prisma test error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Prisma error',
      error: error.message 
    });
  }
}