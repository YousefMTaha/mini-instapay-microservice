import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { UserService } from 'src/services/user.service';
import { AccountService } from 'src/account/account.service';
import { NotificationService } from 'src/notification/notification.service';
import { Types } from 'mongoose';
import { userType } from '../services/user.types';
import { accountType } from '../account/account.types';
import { transactionType } from 'src/transaction.schema';
import { BadRequestException } from '@nestjs/common';
import { SendMoneyDTO } from './dto/send-money.dto';
import { EAccountType } from 'src/utils/Constants/system.constants';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: TransactionsService;
  let accountService: AccountService;
  let userService: UserService;
  let notificationService: NotificationService;

  // Mock data
  const mockUser = {
    _id: new Types.ObjectId(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    defaultAcc: new Types.ObjectId(),
  } as userType;

  const mockAccount = {
    _id: new Types.ObjectId(),
    Balance: 1000,
    userId: mockUser._id,
    PIN: '123456',
    wrongPIN: 0,
  } as accountType;

  const mockTransaction = {
    _id: new Types.ObjectId(),
    amount: 100,
    accSenderId: mockAccount._id,
    accReceiverId: new Types.ObjectId(),
    status: 'Success',
    type: 'Send',
    save: jest.fn().mockResolvedValue({}),
    populate: jest.fn().mockReturnThis(),
  } as unknown as transactionType;

  // Mock services
  const mockTransactionsService = {
    sendMoney: jest.fn(),
    getHistory: jest.fn(),
    changeDefaultAcc: jest.fn(),
    receiveMoney: jest.fn(),
    getById: jest.fn(),
    checkTransactionStatus: jest.fn(),
    checkTransactionOwner: jest.fn(),
    confirmReceive: jest.fn(),
    rejectReceive: jest.fn(),
    requestRefund: jest.fn(),
    getAllTransacions: jest.fn(),
    suspiciousTransaction: jest.fn(),
    approveRefund: jest.fn(),
    rejectRefund: jest.fn(),
    checkForRefund: jest.fn(),
    checkNoOfTries: jest.fn(),
  };

  const mockAccountService = {
    getAccountById: jest.fn(),
    checkDefaultAcc: jest.fn(),
    checkPIN: jest.fn(),
    checkLimit: jest.fn(),
    getAccount: jest.fn(),
  };

  const mockUserService = {
    findUser: jest.fn(),
    getAllAdmins: jest.fn(),
  };

  const mockNotificationService = {
    sendOrRecieve: jest.fn(),
    receiverequest: jest.fn(),
    rejectSend: jest.fn(),
    requestRefund: jest.fn(),
    approveRefund: jest.fn(),
    rejectRefund: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get<TransactionsService>(TransactionsService);
    accountService = module.get<AccountService>(AccountService);
    userService = module.get<UserService>(UserService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMoney', () => {
    it('should send money successfully using default account', async () => {
      // Arrange
      const sendMoneyDto: SendMoneyDTO = {
        receiverData: 'receiver@example.com',
        PIN: '123456',
        amount: 100,
      };
      
      const receiverUser = { ...mockUser, _id: new Types.ObjectId(), email: 'receiver@example.com' };
      const receiverAccount = { ...mockAccount, _id: new Types.ObjectId(), userId: receiverUser._id };
      
      mockAccountService.checkDefaultAcc.mockResolvedValue(mockAccount);
      mockUserService.findUser.mockResolvedValue(receiverUser);
      mockAccountService.checkDefaultAcc.mockResolvedValueOnce(mockAccount).mockResolvedValueOnce(receiverAccount);
      mockTransactionsService.sendMoney.mockResolvedValue(mockTransaction);
      mockNotificationService.sendOrRecieve.mockResolvedValue({ message: 'Done', status: true });

      // Act
      const result = await controller.sendMoney(mockUser, sendMoneyDto);

      // Assert
      expect(accountService.checkDefaultAcc).toHaveBeenCalledWith(
        mockUser,
        EAccountType.OWNER,
      );
      expect(accountService.checkPIN).toHaveBeenCalledWith(
        mockUser,
        mockAccount,
        sendMoneyDto.PIN,
      );
      expect(accountService.checkLimit).toHaveBeenCalledWith(
        sendMoneyDto.amount,
        mockAccount,
      );
      expect(userService.findUser).toHaveBeenCalledWith({
        data: sendMoneyDto.receiverData,
      });
      expect(transactionsService.sendMoney).toHaveBeenCalledWith(
        mockAccount,
        receiverAccount,
        sendMoneyDto.amount,
      );
      expect(notificationService.sendOrReceive).toHaveBeenCalledWith(
        mockUser,
        receiverUser,
        mockTransaction._id,
        mockTransaction.amount,
      );
      expect(result).toEqual({ message: 'Done', status: true });
    });

    it('should send money successfully using specific account', async () => {
      // Arrange
      const sendMoneyDto: SendMoneyDTO = {
        receiverData: 'receiver@example.com',
        PIN: '123456',
        amount: 100,
        accountId: new Types.ObjectId(),
      };
      
      const receiverUser = { ...mockUser, _id: new Types.ObjectId(), email: 'receiver@example.com' };
      const receiverAccount = { ...mockAccount, _id: new Types.ObjectId(), userId: receiverUser._id };
      
      mockAccountService.getAccountById.mockResolvedValue(mockAccount);
      mockUserService.findUser.mockResolvedValue(receiverUser);
      mockAccountService.checkDefaultAcc.mockResolvedValue(receiverAccount);
      mockTransactionsService.sendMoney.mockResolvedValue(mockTransaction);
      mockNotificationService.sendOrRecieve.mockResolvedValue({ message: 'Done', status: true });

      // Act
      const result = await controller.sendMoney(mockUser, sendMoneyDto);

      // Assert
      expect(accountService.getAccountById).toHaveBeenCalledWith(
        mockUser._id,
        sendMoneyDto.accountId,
        EAccountType.OWNER,
      );
      expect(transactionsService.sendMoney).toHaveBeenCalledWith(
        mockAccount,
        receiverAccount,
        sendMoneyDto.amount,
      );
      expect(result).toEqual({ message: 'Done', status: true });
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      // Arrange
      const sendMoneyDto: SendMoneyDTO = {
        receiverData: 'receiver@example.com',
        PIN: '123456',
        amount: 2000, // More than balance
      };
      
      const lowBalanceAccount = { ...mockAccount, Balance: 1000 };
      mockAccountService.checkDefaultAcc.mockResolvedValue(lowBalanceAccount);

      // Act & Assert
      await expect(controller.sendMoney(mockUser, sendMoneyDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(transactionsService.sendMoney).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return transaction history', async () => {
      // Arrange
      const mockHistory = {
        message: 'done',
        status: true,
        data: [mockTransaction],
      };
      mockTransactionsService.getHistory.mockResolvedValue(mockHistory);

      // Act
      const result = await controller.getHistory(mockUser);

      // Assert
      expect(transactionsService.getHistory).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockHistory);
    });
  });

  describe('changeDefault', () => {
    it('should change default account', async () => {
      // Arrange
      const accountId = new Types.ObjectId();
      const newAccount = { ...mockAccount, _id: accountId };
      
      // Mock user with different defaultAcc
      const userWithDiffDefault = {
        ...mockUser,
        defaultAcc: new Types.ObjectId(), // Different than accountId
      } as userType;
      
      mockAccountService.getAccountById.mockResolvedValue(newAccount);
      mockTransactionsService.changeDefaultAcc.mockResolvedValue({
        message: 'Changed',
        status: true,
      });

      // Act
      const result = await controller.changeDefault(userWithDiffDefault, accountId);

      // Assert
      expect(accountService.getAccountById).toHaveBeenCalledWith(
        userWithDiffDefault._id,
        accountId,
        EAccountType.OWNER,
      );
      expect(transactionsService.changeDefaultAcc).toHaveBeenCalledWith(
        userWithDiffDefault,
        newAccount,
      );
      expect(result).toEqual({ message: 'Changed', status: true });
    });

    it('should throw BadRequestException when account is already default', async () => {
      // Arrange
      const accountId = new Types.ObjectId();
      
      // Mock user with same defaultAcc as the one we're trying to set
      const userWithSameDefault = {
        ...mockUser,
        defaultAcc: accountId,
      } as userType;
      
      // toString method needs to be mocked
      userWithSameDefault.defaultAcc.toString = jest.fn().mockReturnValue(accountId.toString());
      accountId.toString = jest.fn().mockReturnValue(accountId.toString());

      // Act & Assert
      await expect(
        controller.changeDefault(userWithSameDefault, accountId),
      ).rejects.toThrow(BadRequestException);
      expect(transactionsService.changeDefaultAcc).not.toHaveBeenCalled();
    });
  });

  // Additional tests can be added for other controller methods
}); 