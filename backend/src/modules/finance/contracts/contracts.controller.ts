import { Request, Response, NextFunction } from 'express';
import * as contractsService from './contracts.service';
import { sendSuccess } from '../../../utils/response';

export async function listContracts(req: Request, res: Response, next: NextFunction) {
  try {
    const { contracts, meta } = await contractsService.listContracts(
      req.orgId!,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, contracts, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getContractById(req: Request, res: Response, next: NextFunction) {
  try {
    const contract = await contractsService.getContractById(req.orgId!, req.params.id);
    sendSuccess(res, contract);
  } catch (err) {
    next(err);
  }
}

export async function createContract(req: Request, res: Response, next: NextFunction) {
  try {
    const contract = await contractsService.createContract(req.orgId!, req.body);
    sendSuccess(res, contract, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateContract(req: Request, res: Response, next: NextFunction) {
  try {
    const contract = await contractsService.updateContract(req.orgId!, req.params.id, req.body);
    sendSuccess(res, contract);
  } catch (err) {
    next(err);
  }
}

export async function deleteContract(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contractsService.deleteContract(req.orgId!, req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function activateContract(req: Request, res: Response, next: NextFunction) {
  try {
    const contract = await contractsService.activateContract(req.orgId!, req.params.id);
    sendSuccess(res, contract);
  } catch (err) {
    next(err);
  }
}

export async function renewContract(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contractsService.renewContract(req.orgId!, req.params.id);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function terminateContract(req: Request, res: Response, next: NextFunction) {
  try {
    const contract = await contractsService.terminateContract(req.orgId!, req.params.id);
    sendSuccess(res, contract);
  } catch (err) {
    next(err);
  }
}

export async function getContractInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const { invoices, meta } = await contractsService.getContractInvoices(
      req.orgId!,
      req.params.id,
      req.query as Record<string, unknown>
    );
    sendSuccess(res, invoices, 200, meta);
  } catch (err) {
    next(err);
  }
}
