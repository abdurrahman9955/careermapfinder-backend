import { Request, Response } from "express";
import prisma from "../../../utils/prisma";
import { Prisma } from "@prisma/client";

const parseDate = (dateString: any): Date | undefined => {
    if (dateString) {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
};

export const createSubscription = async (req: Request, res: Response) => {
    const { 
        userId, email, planType, billingCycle, amount, 
        isActive, isSuspended, isBlocked, 
        trialEndsAt, nextBillingDate, lastPaymentDate, cancellationDate, periodStart
    } = req.body;

    if (!userId || !planType || !billingCycle || !amount || !email) {
        return res.status(400).json({ 
            error: "Missing required fields: companyId, userId, email, planType, billingCycle, and amount." 
        });
    }

    try {
        const subscription = await prisma.subscription.create({
            data: {
                userId,
                email,
                planType,
                billingCycle,
                amount,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined,
                isSuspended: isSuspended !== undefined ? Boolean(isSuspended) : undefined,
                isBlocked: isBlocked !== undefined ? Boolean(isBlocked) : undefined,
                trialEndsAt: parseDate(trialEndsAt),
                nextBillingDate: parseDate(nextBillingDate),
                lastPaymentDate: parseDate(lastPaymentDate),
                cancellationDate: parseDate(cancellationDate),
                periodStart: parseDate(periodStart),
            },
        });

        res.status(201).json(subscription);
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return res.status(400).json({ error: "Invalid foreign key provided (companyId or userId does not exist)." });
            }
        }
        console.error("❌ Error creating Subscription:", error);
        res.status(500).json({ error: `Failed to create subscription: ${error.message}` });
    }
};

export const getSubscriptionById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const subscription = await prisma.subscription.findUnique({
            where: { id: String(id) },
            include: { user: true }
        });

        if (!subscription) {
            return res.status(404).json({ error: "Subscription not found" });
        }

        res.json(subscription);
    } catch (error: any) {
        console.error("❌ Error retrieving Subscription:", error);
        res.status(500).json({ error: `Failed to retrieve subscription: ${error.message}` });
    }
};

export const getSubscriptionsByUser = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: String(userId) },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json(subscriptions);
    } catch (error: any) {
        console.error("❌ Error retrieving Subscriptions by User:", error);
        res.status(500).json({ error: `Failed to retrieve subscriptions for user: ${error.message}` });
    }
};

export const updateSubscription = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const data: Prisma.SubscriptionUpdateInput = {
        ...updateData,
       
        isActive: updateData.isActive !== undefined ? Boolean(updateData.isActive) : undefined,
        isSuspended: updateData.isSuspended !== undefined ? Boolean(updateData.isSuspended) : undefined,
        isBlocked: updateData.isBlocked !== undefined ? Boolean(updateData.isBlocked) : undefined,
       
        trialEndsAt: parseDate(updateData.trialEndsAt),
        nextBillingDate: parseDate(updateData.nextBillingDate),
        lastPaymentDate: parseDate(updateData.lastPaymentDate),
        cancellationDate: parseDate(updateData.cancellationDate),
        periodStart: parseDate(updateData.periodStart),
    };
    
    delete data.id; 
    delete data.createdAt; 
    delete data.updatedAt;

    try {
        const subscription = await prisma.subscription.update({
            where: { id: String(id) },
            data,
            include: { user: true }
        });

        res.json(subscription);
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "Subscription not found for update." });
        }
        console.error("❌ Error updating Subscription:", error);
        res.status(500).json({ error: `Failed to update subscription: ${error.message}` });
    }
};

export const deleteSubscription = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.subscription.delete({
            where: { id: String(id) },
        });

        res.status(204).send(); 
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "Subscription not found for deletion." });
        }
        console.error("❌ Error deleting Subscription:", error);
        res.status(500).json({ error: `Failed to delete subscription: ${error.message}` });
    }
};
