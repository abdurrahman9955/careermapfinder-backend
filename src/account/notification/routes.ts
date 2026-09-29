import { Router } from "express";
import {  createNotification, getNotificationsByUser, getUnreadNotificationCount,
markNotificationAsRead, markAllNotificationsAsRead, deleteNotification,} from "./controller";
import { authenticateUser } from "../middleware/authMiddleware";

const notificationRouter = Router();

notificationRouter.post("/notifications",authenticateUser, createNotification);

notificationRouter.get("/notifications/user/:userId", authenticateUser, getNotificationsByUser);

notificationRouter.get("/notifications/unread/count/:userId", authenticateUser, getUnreadNotificationCount);

notificationRouter.put("/notifications/read/:id", authenticateUser, markNotificationAsRead);

notificationRouter.put("/notifications/read-all/:userId", authenticateUser, markAllNotificationsAsRead);

notificationRouter.delete("/notifications/:id", authenticateUser, deleteNotification);

export default notificationRouter;
