import { Request, Response } from "express";
import prisma from "../../../utils/prisma";
import { Prisma } from "@prisma/client";

export const createInvoice = async (req: Request, res: Response) => {
    const { 
        userId, name, invoiceId, amount, status, 
        planType, billingCycle, nextBillingDate, isCompleted, 
        cardType, cardNumber, cardExpiry, isPrimary, invoiceLink
    } = req.body;

    if (!userId || !invoiceId || !amount || !status || !planType || !billingCycle || !nextBillingDate) {
        return res.status(400).json({ 
            error: "Missing required fields: userId, companyId, invoiceId, amount, status, planType, billingCycle, and nextBillingDate." 
        });
    }

    try {
        const invoice = await prisma.invoice.create({
            data: {
                userId,
                name,
                invoiceId,
                amount,
                status,
                planType,
                billingCycle,
                invoiceLink,
                isCompleted: isCompleted !== undefined ? Boolean(isCompleted) : undefined,
                isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : undefined,
                nextBillingDate: new Date(),
                cardType,
                cardNumber,
                cardExpiry,
            },
        });

        res.status(201).json(invoice);
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return res.status(400).json({ error: "Invalid foreign key provided (userId or companyId does not exist)." });
        }
        console.error("❌ Error creating Invoice:", error);
        res.status(500).json({ error: `Failed to create invoice: ${error.message}` });
    }
};

export const getInvoiceById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id:String(id) },
            include: { user: true }
        });

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        res.json(invoice);
    } catch (error: any) {
        console.error("❌ Error retrieving Invoice:", error);
        res.status(500).json({ error: `Failed to retrieve invoice: ${error.message}` });
    }
};


export const getInvoicesByUser = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const invoices = await prisma.invoice.findMany({
            where: { userId:String(userId) },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json(invoices);
    } catch (error: any) {
        console.error("❌ Error retrieving Invoices by User:", error);
        res.status(500).json({ error: `Failed to retrieve invoices for user: ${error.message}` });
    }
};

export const deleteInvoice = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.invoice.delete({
            where: { id:String(id) },
        });

        res.status(204).send(); 
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "Invoice not found for deletion." });
        }
        console.error("❌ Error deleting Invoice:", error);
        res.status(500).json({ error: `Failed to delete invoice: ${error.message}` });
    }
};
