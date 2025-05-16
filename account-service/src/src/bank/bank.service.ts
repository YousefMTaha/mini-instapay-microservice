import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bank } from '../schemas/bank.schema';

@Injectable()
export class BankService {
  constructor(
    @InjectModel(Bank.name) private readonly _bankModel: Model<Bank>,
  ) {}
  async getBanks() {
    return await this._bankModel.find();
  }

  async checkBankId(id: Types.ObjectId) {
    return await this._bankModel.findById(id);
  }
}
