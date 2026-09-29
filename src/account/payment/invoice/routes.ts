import { Router } from "express";
import { 
    createInvoice,
    getInvoiceById,
    getInvoicesByUser,
    deleteInvoice,
} from "./controllers";
import { authenticateUser } from "../../middleware/authMiddleware";

const invoiceRouter = Router();

invoiceRouter.post("/invoices",authenticateUser, createInvoice);
invoiceRouter.get("/invoices/:id",authenticateUser, getInvoiceById);
invoiceRouter.get("/invoices/user/:userId",authenticateUser, getInvoicesByUser);
invoiceRouter.delete("/invoices/:id",authenticateUser, deleteInvoice);

export default invoiceRouter;
