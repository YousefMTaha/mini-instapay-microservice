import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, userType } from 'src/user.schema';
import { MailService } from 'utils/email.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { compareSync, hashSync } from 'bcryptjs';
import { userRoles, userStatus } from 'src/user.constants';

jest.mock('bcryptjs', () => ({
  compareSync: jest.fn(),
  hashSync: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;
  let mailService: MailService;

  const mockUser = {
    _id: new Types.ObjectId(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    mobileNumber: '1234567890',
    password: 'hashedPassword',
    role: userRoles.User,
    status: userStatus.Offline,
    updateOne: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    populate: jest.fn().mockReturnThis(),
    toObject: jest.fn().mockReturnThis(),
  } as unknown as userType;

  const mockMailService = {
    sendEmail: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user data', async () => {
      mockUser.defaultAcc = new Types.ObjectId();
      jest.spyOn(mockUser, 'populate').mockResolvedValue({
        ...mockUser,
        defaultAcc: {
          bankId: { name: 'Test Bank' },
          cardId: { cardNo: '1234567890123456' },
        },
      } as unknown as userType);

      const result = await service.getUser(mockUser);

      expect(mockUser.populate).toHaveBeenCalledWith({
        path: 'defaultAcc',
        select: 'bankId cardId',
        populate: [
          {
            path: 'bankId',
          },
          {
            path: 'cardId',
            select: 'cardNo',
          },
        ],
      });
      expect(result).toEqual({
        message: 'done',
        status: true,
        data: expect.any(Object),
      });
    });

    it('should return user data without populating if no defaultAcc', async () => {
      const userWithoutDefaultAcc = { ...mockUser, defaultAcc: null };

      const result = await service.getUser(userWithoutDefaultAcc as userType);

      expect(result).toEqual({
        message: 'done',
        status: true,
        data: userWithoutDefaultAcc,
      });
    });
  });

  describe('updateUser', () => {
    it('should update the user', async () => {
      const updateUserDto: UpdateUserDTO = { firstName: 'Jane' };
      jest.spyOn(mockUser, 'updateOne').mockResolvedValue({});

      const result = await service.updateUser(mockUser, updateUserDto);

      expect(mockUser.updateOne).toHaveBeenCalledWith(updateUserDto);
      expect(result).toEqual({ message: 'updated', status: true });
    });

    it('should throw ConflictException if mobile number already exists', async () => {
      const updateUserDto: UpdateUserDTO = { mobileNumber: '9876543210' };
      mockUserModel.findOne.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(
        service.updateUser(mockUser, updateUserDto),
      ).rejects.toThrow(ConflictException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        mobileNumber: updateUserDto.mobileNumber,
      });
    });
  });

  describe('updatePassword', () => {
    it('should update the password if old password is correct', async () => {
      const updatePasswordDto: UpdatePasswordDTO = {
        oldPassword: 'oldpass',
        newPassword: 'newpass',
      };
      mockUserModel.findById.mockResolvedValue(mockUser);
      (compareSync as jest.Mock).mockReturnValue(true);
      (hashSync as jest.Mock).mockReturnValue('newhashedpassword');

      const result = await service.updatePassword(mockUser, updatePasswordDto);

      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id);
      expect(compareSync).toHaveBeenCalledWith(
        updatePasswordDto.oldPassword,
        mockUser.password,
      );
      expect(mockUser.updateOne).toHaveBeenCalledWith({
        password: 'newhashedpassword',
        status: userStatus.Offline,
      });
      expect(result).toEqual({ message: 'updated', status: true });
    });

    it('should throw BadRequestException if old password is incorrect', async () => {
      const updatePasswordDto: UpdatePasswordDTO = {
        oldPassword: 'wrongpass',
        newPassword: 'newpass',
      };
      mockUserModel.findById.mockResolvedValue(mockUser);
      (compareSync as jest.Mock).mockReturnValue(false);

      await expect(
        service.updatePassword(mockUser, updatePasswordDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockUser.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should set user status to Offline', async () => {
      const result = await service.logout(mockUser);

      expect(mockUser.status).toBe(userStatus.Offline);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'done', status: true });
    });
  });

  describe('findUser', () => {
    it('should find user by id', async () => {
      const id = new Types.ObjectId();
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.findUser({ id });

      expect(mockUserModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });

    it('should find user by email', async () => {
      const email = 'test@example.com';
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findUser({ email });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });

    it('should find user by email or mobile', async () => {
      const data = 'test@example.com';
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findUser({ data });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        $or: [{ email: data }, { mobileNumber: data }],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.findUser({ data: 'nonexistent@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(users),
      });

      const result = await service.getAll();

      expect(mockUserModel.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('bannedUser', () => {
    it('should ban a user', async () => {
      const userId = new Types.ObjectId();
      const regularUser = {
        ...mockUser,
        role: userRoles.User,
        status: userStatus.Online,
        save: jest.fn().mockResolvedValue({}),
        email: 'user@example.com',
      } as unknown as userType;
      
      jest.spyOn(service, 'findUser').mockResolvedValue(regularUser);
      mockMailService.sendEmail.mockResolvedValue(true);

      const result = await service.bannedUser(userId);

      expect(service.findUser).toHaveBeenCalledWith({ id: userId });
      expect(regularUser.status).toBe(userStatus.Suspended);
      expect(regularUser.save).toHaveBeenCalled();
      expect(mailService.sendEmail).toHaveBeenCalledWith({
        to: regularUser.email,
        subject: 'Account Banned',
        html: expect.any(String),
      });
      expect(result).toEqual({ message: 'Suspended', status: true });
    });

    it('should throw BadRequestException if user is an admin', async () => {
      const userId = new Types.ObjectId();
      const adminUser = {
        ...mockUser,
        role: userRoles.Admin,
      };
      
      jest.spyOn(service, 'findUser').mockResolvedValue(adminUser as userType);

      await expect(service.bannedUser(userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is already banned', async () => {
      const userId = new Types.ObjectId();
      const bannedUser = {
        ...mockUser,
        role: userRoles.User,
        status: userStatus.Suspended,
      };
      
      jest.spyOn(service, 'findUser').mockResolvedValue(bannedUser as userType);

      await expect(service.bannedUser(userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('getAllAdmins', () => {
    it('should return all admins', async () => {
      const admins = [{ ...mockUser, role: userRoles.Admin }];
      mockUserModel.find.mockResolvedValue(admins);

      const result = await service.getAllAdmins();

      expect(mockUserModel.find).toHaveBeenCalledWith({
        role: userRoles.Admin,
      });
      expect(result).toEqual(admins);
    });

    it('should throw NotFoundException if no admins found', async () => {
      mockUserModel.find.mockResolvedValue([]);

      await expect(service.getAllAdmins()).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSocketId', () => {
    it('should update user socket id', async () => {
      const userId = 'user-id';
      const socketId = 'socket-id';
      mockUserModel.findByIdAndUpdate.mockResolvedValue({});

      await service.updateSocketId(userId, socketId);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        socketId,
      });
    });
  });

  describe('getUserById', () => {
    it('should find user by id', async () => {
      const userId = 'user-id';
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserData', () => {
    it('should update user data', async () => {
      const userData = {
        _id: new Types.ObjectId(),
        firstName: 'Updated',
      };
      mockUserModel.updateOne.mockResolvedValue({ acknowledged: true });

      const result = await service.updateUserData(userData);

      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: userData._id },
        userData,
      );
      expect(result).toEqual({ acknowledged: true });
    });
  });

  describe('getManyUsers', () => {
    it('should find many users by ids', async () => {
      const ids = ['id1', 'id2'];
      const users = [mockUser];
      mockUserModel.find.mockResolvedValue(users);

      const result = await service.getManyUsers(ids);

      expect(mockUserModel.find).toHaveBeenCalledWith({
        _id: { $in: ids },
      });
      expect(result).toEqual(users);
    });
  });
}); 