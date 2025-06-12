import { Router } from "express";

import * as unitController from "./controllers/units.controller";
import * as unitConversionController from "./controllers/unit-conversions.controller";
import * as categoryController from "./controllers/categories.controller";
import * as itemController from "./controllers/items.controller";
import * as partyController from "./controllers/parties.controller";
import * as groupController from "./controllers/groups.controller";
import * as bankAccountController from "./controllers/accounts.controller";
import * as bankTransactionController from "./controllers/transaction.controller";
import * as paymentController from "./controllers/payments.controller";
import * as documentController from "./controllers/documents.controller";
import * as initController from "./controllers/init.controller";
import * as initDataController from "./controllers/initData.controller";
import * as firmController from "./controllers/firms.controller";

import * as shareController from "./controllers/sync.controller";
const router = Router();

router.post("/sync/pull", shareController.pullLocalData);
router.post("/sync/push", shareController.pushToLocalDb);
// Initialization
router.get("/init", initController.initializeHandler);
router.get("/initData", initDataController.initDataHandler);

// Firms
router.get("/firms", firmController.getAllFirms);
router.post("/firms", firmController.createFirm);
router.post("/firm-share", shareController.createSharedUser);
router.get("/firms/:id", firmController.getFirmById);
router.put("/firms/:id", firmController.updateFirm);
router.delete("/firms/:id", firmController.deleteFirm);
router.put("/firm-share/:id", shareController.updateSharedUser);
router.delete("/firm-share/:id", shareController.deleteSharedUser);
router.get("/firm/:firm_id/shares", shareController.getSharedUsersByFirm);
router.get("/user/:user_number/firms", shareController.getFirmsByUserNumber);
router.patch("/firm/:firm_id/toggle-sync", shareController.toggleSyncEnabled);

// Items & Subroutes
router.get("/items", itemController.getItems);
router.post("/items", itemController.createItem);
router.get("/items/categories", categoryController.getAllCategories);
router.post("/items/categories", categoryController.createCategory);
router.get("/items/units", unitController.getAllUnits);
router.post("/items/units", unitController.createUnit);
router.get("/items/unit-conversions", unitConversionController.getAllUnitConversions);
router.post("/items/unit-conversions", unitConversionController.createUnitConversion);
router.get("/items/:id", itemController.getItemById);
router.put("/items/:id", itemController.updateItem);
router.delete("/items/:id", itemController.deleteItem);
router.get("/items/categories/:id", categoryController.getCategoryById);
router.put("/items/categories/:id", categoryController.updateCategory);
router.delete("/items/categories/:id", categoryController.deleteCategory);
router.get("/items/units/:id", unitController.getUnitById);
router.put("/items/units/:id", unitController.updateUnit);
router.delete("/items/units/:id", unitController.deleteUnit);
router.get("/items/unit-conversions/:id", unitConversionController.getUnitConversionById);
router.put("/items/unit-conversions/:id", unitConversionController.updateUnitConversion);
router.delete("/items/unit-conversions/:id", unitConversionController.deleteUnitConversion);

// Parties
router.get("/parties", partyController.getAllParties);
router.post("/parties", partyController.createParty);
router.get("/parties/groups", groupController.getAllGroups);
router.post("/parties/groups", groupController.createGroup);
router.get("/parties/:id", partyController.getPartyById);
router.put("/parties/:id", partyController.updateParty);
router.delete("/parties/:id", partyController.deleteParty);
router.get("/parties/groups/:id", groupController.getGroupById);
router.put("/parties/groups/:id", groupController.updateGroup);
router.delete("/parties/groups/:id", groupController.deleteGroup);

// Banking
router.get("/banking/accounts", bankAccountController.getAllBankAccounts);
router.post("/banking/accounts", bankAccountController.createBankAccount);
router.get("/banking/accounts/:id", bankAccountController.getBankAccountById);
router.put("/banking/accounts/:id", bankAccountController.updateBankAccount);
router.delete("/banking/accounts/:id", bankAccountController.deleteBankAccount);

router.get("/banking/transactions", bankTransactionController.getAllBankTransactions);
router.post("/banking/transactions", bankTransactionController.createBankTransaction);
router.get("/banking/transactions/:id", bankTransactionController.getBankTransactionById);
router.put("/banking/transactions/:id", bankTransactionController.updateBankTransaction);
router.delete("/banking/transactions/:id", bankTransactionController.deleteBankTransaction);

// Payments
router.get("/payment", paymentController.getAllPayments);
router.post("/payment", paymentController.createPayment);
router.get("/payment/:id", paymentController.getPaymentById);
router.put("/payment/:id", paymentController.updatePayment);
router.delete("/payment/:id", paymentController.deletePayment);

// Documents
router.get("/documents", documentController.getAllDocuments);
router.post("/documents", documentController.createDocument);
router.get("/documents/:id", documentController.getDocumentById);
router.put("/documents/:id", documentController.updateDocument);
router.delete("/documents/:id", documentController.deleteDocument);





export default router;
