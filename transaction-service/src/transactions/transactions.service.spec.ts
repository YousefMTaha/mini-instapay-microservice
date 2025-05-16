import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, transactionType } from 'src/transaction.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/services/email.service';
import { UserService } from 'src/services/user.service';
import { AccountService } from 'src/account/account.service';
import { userType } from '../services/user.types';
import { accountType } from '../account/account.types';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionStatus, TransactionType } from 'src/transaction.constants';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionModel: Model<Transaction>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let mailService: MailService;
  let userService: UserService;
  let accountService: AccountService;

  // Mock data
  const mockUser = {
    _id: new Types.ObjectId(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    authTypes: [],
    defaultAcc: new Types.ObjectId(),
  } as userType;

  const mockAccount = {
    _id: new Types.ObjectId(),
    Balance: 1000,
    userId: mockUser._id,
    PIN: '123456',
    wrongPIN: 0,
    limit: {
      amount: 2000,
      spent: 500,
    },
    save: jest.fn().mockResolvedValue({}),
    updateOne: jest.fn().mockResolvedValue({}),
  } as unknown as accountType;

  const mockTransaction = {
    _id: new Types.ObjectId(),
    amount: 100,
    accSenderId: mockAccount._id,
    accReceiverId: new Types.ObjectId(),
    status: TransactionStatus.SUCCESS,
    type: TransactionType.SEND,
    save: jest.fn().mockResolvedValue({}),
    populate: jest.fn().mockReturnThis(),
    toObject: jest.fn().mockReturnThis(),
  } as unknown as transactionType;

  // Mock services
  const mockTransactionModel = {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockMailService = {
    sendEmail: jest.fn(),
  };

  const mockUserService = {
    updateUser: jest.fn(),
    getManyUsers: jest.fn(),
  };

  const mockAccountService = {
    updateAccount: jest.fn(),
    getAccount: jest.fn(),
    getAccountById: jest.fn(),
    getManyAccounts: jest.fn(),
    getUserAccounts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionModel = module.get<Model<Transaction>>(getModelToken(Transaction.name));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    mailService = module.get<MailService>(MailService);
    userService = module.get<UserService>(UserService);
    accountService = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getById', () => {
    it('should return a transaction by id', async () => {
      // Arrange
      const transactionId = new Types.ObjectId();
      mockTransactionModel.findById.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.getById(transactionId);

      // Assert
      expect(mockTransactionModel.findById).toHaveBeenCalledWith(transactionId);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      // Arrange
      const transactionId = new Types.ObjectId();
      mockTransactionModel.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getById(transactionId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendMoney', () => {
    it('should create a transaction and update account balances', async () => {
      // Arrange
      const senderAcc = { ...mockAccount, Balance: 1000 } as accountType;
      const receiverAcc = { ...mockAccount, _id: new Types.ObjectId(), Balance: 500 } as accountType;
      const amount = 200;

      mockTransactionModel.create.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.sendMoney(senderAcc, receiverAcc, amount);

      // Assert
      expect(senderAcc.Balance).toBe(800); // 1000 - 200
      expect(receiverAcc.Balance).toBe(700); // 500 + 200
      expect(accountService.updateAccount).toHaveBeenCalledWith(senderAcc);
      expect(accountService.updateAccount).toHaveBeenCalledWith(receiverAcc);
      expect(mockTransactionModel.create).toHaveBeenCalledWith({
        amount,
        accReceiverId: receiverAcc._id,
        accSenderId: senderAcc._id,
        type: TransactionType.SEND,
      });
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('checkNoOfTries', () => {
    it('should not throw error if wrongPIN is less than 5', async () => {
      // Arrange
      const account = { ...mockAccount, wrongPIN: 3 } as accountType;

      // Act & Assert
      await expect(service.checkNoOfTries(account, mockUser)).resolves.not.toThrow();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if wrongPIN is 5 or more', async () => {
      // Arrange
      const account = { ...mockAccount, wrongPIN: 5 } as accountType;
      mockJwtService.sign.mockReturnValue('token123');
      mockConfigService.get.mockReturnValue('secret');

      // Act & Assert
      await expect(service.checkNoOfTries(account, mockUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(userService.updateUser).toHaveBeenCalled();
      expect(mockMailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('changeDefaultAcc', () => {
    it('should update user default account', async () => {
      // Arrange
      const account = { ...mockAccount, _id: new Types.ObjectId() } as accountType;
      mockUserService.updateUser.mockResolvedValue({ message: 'Updated', status: true });

      // Act
      const result = await service.changeDefaultAcc(mockUser, account);

      // Assert
      expect(mockUser.defaultAcc).toEqual(account._id);
      expect(userService.updateUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ message: 'Changed', status: true });
    });
  });

  describe('getHistory', () => {
    it('should return user transaction history', async () => {
      // Arrange
      const userAccounts = [mockAccount, { ...mockAccount, _id: new Types.ObjectId() }];
      const transactions = [mockTransaction, { ...mockTransaction, _id: new Types.ObjectId() }];
      const users = [mockUser, { ...mockUser, _id: new Types.ObjectId() }];

      mockAccountService.getUserAccounts.mockResolvedValue(userAccounts);
      mockTransactionModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(transactions),
      });
      mockAccountService.getManyAccounts.mockResolvedValue(userAccounts);
      mockUserService.getManyUsers.mockResolvedValue(users);

      // Act
      const result = await service.getHistory(mockUser);

      // Assert
      expect(accountService.getUserAccounts).toHaveBeenCalledWith(mockUser._id.toString());
      expect(result).toEqual({
        message: 'done',
        status: true,
        data: expect.any(Array),
      });
    });

    it('should throw NotFoundException if no accounts found', async () => {
      // Arrange
      mockAccountService.getUserAccounts.mockResolvedValue([]);

      // Act & Assert
      await expect(service.getHistory(mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if no transactions found', async () => {
      // Arrange
      mockAccountService.getUserAccounts.mockResolvedValue([mockAccount]);
      mockTransactionModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      // Act & Assert
      await expect(service.getHistory(mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('receiveMoney', () => {
    it('should create a pending transaction for money receive request', async () => {
      // Arrange
      const senderAcc = mockAccount;
      const recAcc = { ...mockAccount, _id: new Types.ObjectId() } as accountType;
      const amount = 100;
      const pendingTransaction = {
        ...mockTransaction,
        status: TransactionStatus.PENDING,
        type: TransactionType.RECEIVE,
      };

      mockTransactionModel.create.mockResolvedValue(pendingTransaction);

      // Act
      const result = await service.receiveMoney(senderAcc, recAcc, amount);

      // Assert
      expect(mockTransactionModel.create).toHaveBeenCalledWith({
        amount,
        accSenderId: senderAcc._id,
        accReceiverId: recAcc._id,
        status: TransactionStatus.PENDING,
        type: TransactionType.RECEIVE,
      });
      expect(result).toEqual(pendingTransaction);
    });
  });

  describe('confirmReceive', () => {
    it('should update account balances and change transaction status', async () => {
      // Arrange
      const senderAccount = { ...mockAccount, Balance: 1000 } as accountType;
      const receiverAccount = { ...mockAccount, _id: new Types.ObjectId(), Balance: 500 } as accountType;
      const transaction = {
        ...mockTransaction,
        status: TransactionStatus.PENDING,
        amount: 200,
        save: jest.fn().mockResolvedValue({}),
      } as unknown as transactionType;

      // Act
      const result = await service.confirmReceive(senderAccount, receiverAccount, transaction);

      // Assert
      expect(senderAccount.Balance).toBe(800); // 1000 - 200
      expect(receiverAccount.Balance).toBe(700); // 500 + 200
      expect(transaction.status).toBe(TransactionStatus.SUCCESS);
      expect(accountService.updateAccount).toHaveBeenCalledWith(senderAccount);
      expect(accountService.updateAccount).toHaveBeenCalledWith(receiverAccount);
      expect(transaction.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'done', status: true });
    });
  });

  describe('checkTransactionStatus', () => {
    it('should not throw error if transaction status is PENDING', () => {
      // Arrange
      const transaction = {
        ...mockTransaction,
        status: TransactionStatus.PENDING,
      } as transactionType;

      // Act & Assert
      expect(() => service.checkTransactionStatus(transaction)).not.toThrow();
    });

    it('should throw BadRequestException if transaction status is not PENDING', () => {
      // Arrange
      const transaction = {
        ...mockTransaction,
        status: TransactionStatus.SUCCESS,
      } as transactionType;

      // Act & Assert
      expect(() => service.checkTransactionStatus(transaction)).toThrow(BadRequestException);
    });
  });

  // Additional tests can be added for other service methods
}); 