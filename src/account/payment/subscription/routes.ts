import { Router } from "express";
import { 
    createSubscription,
    getSubscriptionById,
    getSubscriptionsByUser,
    updateSubscription,
    deleteSubscription,
} from "./controllers";
import { authenticateUser } from "../../middleware/authMiddleware";

const subscriptionRouter = Router();

subscriptionRouter.post("/subscriptions",authenticateUser, createSubscription);

subscriptionRouter.get("/subscriptions/:id",authenticateUser, getSubscriptionById);

subscriptionRouter.get("/subscriptions/user/:userId",authenticateUser, getSubscriptionsByUser);

subscriptionRouter.put("/subscriptions/:id",authenticateUser, updateSubscription);

subscriptionRouter.delete("/subscriptions/:id",authenticateUser, deleteSubscription);

export default subscriptionRouter;
