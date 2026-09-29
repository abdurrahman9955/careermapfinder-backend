import express from 'express';
import prisma from '../../../utils/prisma';

const getCurrentUser = express.Router();

getCurrentUser.get('/getAllUsers', async (req, res) => {
  try {
    
    const { searchQuery, cursor, limit } = req.query;

    let whereUsers = {}; 

    if (searchQuery) {
      whereUsers = {
        OR: [
          { id: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { fullName: { contains: searchQuery, mode: 'insensitive' } },
          { companyName: { contains: searchQuery, mode: 'insensitive' } },
          { industry: { contains: searchQuery, mode: 'insensitive' } },
          { country: { contains: searchQuery, mode: 'insensitive' } },
          { role: { contains: searchQuery, mode: 'insensitive' } },
          { subscriptionType: { contains: searchQuery, mode: 'insensitive' } },
          { companyAddress: { contains: searchQuery, mode: 'insensitive' } },
          { handle: { contains: searchQuery, mode: 'insensitive' } },
          { bio: { contains: searchQuery, mode: 'insensitive' } },
        ],
      };
    }

    const allUsers = await prisma.user.findMany({
      where: whereUsers,
      take: Number(limit),
      ...(cursor && {
        cursor: {
          ...whereUsers,
          id: String(cursor), 
        },
      }),
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ success: false, error: 'No users found' });
    }

    const nextCursor = allUsers.length === Number(limit)
      ? allUsers[allUsers.length - 1].id
      : null;

    res.json({ success: true, allUsers, nextCursor, });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

getCurrentUser.get('/userInfo', async (req, res) => {
  try {

    const userId = req.headers['user-id'] as string; 

    const currentUser = await prisma.user.findUnique({ where: { id: userId, }, });

    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, currentUser });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

getCurrentUser.get('/userInfo/:userId', async (req, res) => {
  try {

    const userId = req.params.userId; 

    const currentUser = await prisma.user.findUnique({  where: {  id: userId }, });

    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, currentUser });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

getCurrentUser.put('/update-user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId as string;
    const { email, fullName, handle, profileImage, bio, password, isAdmin, isActive, isBlocked, isSuspended } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        fullName,
        handle,
        profileImage,
        bio,
        password,
        isAdmin,
        isActive,
        isBlocked,
        isSuspended
      },
     
    });
   
    res.status(200).json({ success: true, message: 'User account updated successfully' });
  } catch (error) {
    console.error('Error updating user account:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

getCurrentUser.delete('/deleteAccount', async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    
    res.status(200).json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



export default getCurrentUser;


