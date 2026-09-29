import { Request, Response } from "express";
import prisma from "../../utils/prisma"; 

export const createNotification = async (req: Request, res: Response) => {
   
    const { userId, title, description } = req.body;

    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                description,
            },
        });

        res.status(201).json(notification);
    } catch (error: any) {
        console.error("❌ Error creating notification:", error);
        res.status(500).json({ error: `Failed to create notification: ${error.message}` });
    }
};

export const getNotificationsByUser = async (req: Request, res: Response) => {
    const { userId } = req.params; 

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: String(userId) },
            orderBy: { createdAt: 'desc' }, 
            take: 10, 
        });

        res.json(notifications);
    } catch (error: any) {
        console.error("❌ Error retrieving notifications:", error);
        res.status(500).json({ error: `Failed to retrieve notifications: ${error.message}` });
    }
};


export const getUnreadNotificationCount = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const count = await prisma.notification.count({
            where: {
                userId: String(userId),
                isRead: false,
            },
        });
        res.json({ count });
    } catch (error: any) {
        console.error("❌ Error retrieving unread count:", error);
        res.status(500).json({ error: `Failed to retrieve count: ${error.message}` });
    }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
    const { id } = req.params; 

    try {
        const notification = await prisma.notification.update({
            where: { id:String(id) },
            data: { isRead: true },
        });

        res.json(notification);
    } catch (error: any) {
        if (error instanceof Error) {
            return res.status(404).json({ error: "Notification not found." });
        }
        console.error("❌ Error marking notification as read:", error);
        res.status(500).json({ error: `Failed to update notification: ${error.message}` });
    }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
   
    const { userId } = req.params; 

    try {
        const result = await prisma.notification.updateMany({
            where: { 
                userId: String(userId),
                isRead: false 
            },
            data: { isRead: true },
        });

        res.json({ 
            count: result.count, 
            message: `${result.count} notifications marked as read for user ${userId}.` 
        });
    } catch (error: any) {
        console.error("❌ Error marking all notifications as read:", error);
        res.status(500).json({ error: `Failed to update notifications: ${error.message}` });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.notification.delete({
            where: { id: String(id) },
        });

        res.status(204).send(); 
    } catch (error: any) {
        if (error instanceof Error) {
            return res.status(404).json({ error: "Notification not found for deletion." });
        }
        console.error("❌ Error deleting notification:", error);
        res.status(500).json({ error: `Failed to delete notification: ${error.message}` });
    }
};
