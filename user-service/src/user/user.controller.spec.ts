import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { Types } from 'mongoose';
import { userType } from 'src/user.schema';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { EmailDTO } from 'utils/common/common.dto';
import { ConfirmChangeEmailDTO } from '../auth/dto/confirm-change-email.dto';
import { BannedUserDTO } from './dto/banned-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let authService: AuthService;

  const mockUser = {
    _id: new Types.ObjectId(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    mobileNumber: '1234567890',
    password: 'hashedPassword',
    role: 'User',
    status: 'Online',
    defaultAcc: new Types.ObjectId(),
    updateOne: jest.fn(),
    save: jest.fn(),
  } as unknown as userType;

  const mockUserService = {
    getUser: jest.fn(),
    updateUser: jest.fn(),
    updatePassword: jest.fn(),
    logout: jest.fn(),
    getAll: jest.fn(),
    bannedUser: jest.fn(),
    getUserById: jest.fn(),
    updateSocketId: jest.fn(),
    getAllAdmins: jest.fn(),
    findUser: jest.fn(),
    updateUserData: jest.fn(),
    getManyUsers: jest.fn(),
  };

  const mockAuthService = {
    changeMail: jest.fn(),
    confirmUpdateMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should call userService.getUser with the correct user', async () => {
      const expectedResult = { message: 'done', status: true, data: mockUser };
      mockUserService.getUser.mockResolvedValue(expectedResult);

      const result = await controller.getUser(mockUser);

      expect(userService.getUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should call userService.updateUser with the correct parameters', async () => {
      const updateDto: UpdateUserDTO = { firstName: 'Jane' };
      const expectedResult = { message: 'updated', status: true };
      mockUserService.updateUser.mockResolvedValue(expectedResult);

      const result = await controller.updateUser(mockUser, updateDto);

      expect(userService.updateUser).toHaveBeenCalledWith(mockUser, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updatePassword', () => {
    it('should call userService.updatePassword with the correct parameters', async () => {
      const updatePasswordDto: UpdatePasswordDTO = {
        oldPassword: 'oldPass',
        newPassword: 'newPass',
      };
      const expectedResult = { message: 'updated', status: true };
      mockUserService.updatePassword.mockResolvedValue(expectedResult);

      const result = await controller.updatePassword(mockUser, updatePasswordDto);

      expect(userService.updatePassword).toHaveBeenCalledWith(
        mockUser,
        updatePasswordDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateEmail', () => {
    it('should call authService.changeMail with the correct parameters', async () => {
      const emailDto: EmailDTO = { email: 'newemail@example.com' };
      const expectedResult = { message: 'Check your email', status: true };
      mockAuthService.changeMail.mockResolvedValue(expectedResult);

      const result = await controller.updateEmail(emailDto, mockUser);

      expect(authService.changeMail).toHaveBeenCalledWith(
        mockUser,
        emailDto.email,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('confirmChangeEmail', () => {
    it('should call authService.confirmUpdateMail with the correct parameters', async () => {
      const confirmDto: ConfirmChangeEmailDTO = {
        token: 'token123',
        otp: '123456',
      };
      const expectedResult = { message: 'Email updated', status: true };
      mockAuthService.confirmUpdateMail.mockResolvedValue(expectedResult);

      const result = await controller.confirmChangeEmail(confirmDto);

      expect(authService.confirmUpdateMail).toHaveBeenCalledWith(
        confirmDto.token,
        confirmDto.otp,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should call userService.logout with the correct user', async () => {
      const expectedResult = { message: 'done', status: true };
      mockUserService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout(mockUser);

      expect(userService.logout).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllUsers', () => {
    it('should call userService.getAll', async () => {
      const expectedResult = [mockUser];
      mockUserService.getAll.mockResolvedValue(expectedResult);

      const result = await controller.getAllUsers();

      expect(userService.getAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('bannedUser', () => {
    it('should call userService.bannedUser with the correct userId', async () => {
      const bannedDto: BannedUserDTO = { userId: new Types.ObjectId() };
      const expectedResult = { message: 'Suspended', status: true };
      mockUserService.bannedUser.mockResolvedValue(expectedResult);

      const result = await controller.bannedUser(bannedDto);

      expect(userService.bannedUser).toHaveBeenCalledWith(bannedDto.userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserById', () => {
    it('should call userService.getUserById with the correct id', async () => {
      const userId = '60d5ec9c17a2c2b8c8e8b4b6';
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(userId);

      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateSocketId', () => {
    it('should call userService.updateSocketId with the correct parameters', async () => {
      const body = { userId: '123', socketId: 'socket456' };

      await controller.updateSocketId(body);

      expect(userService.updateSocketId).toHaveBeenCalledWith(
        body.userId,
        body.socketId,
      );
    });
  });

  describe('findUser', () => {
    it('should call userService.findUser with the correct parameters', async () => {
      const body = { email: 'test@example.com' };
      mockUserService.findUser.mockResolvedValue(mockUser);

      const result = await controller.findUser(body);

      expect(userService.findUser).toHaveBeenCalledWith(body);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserMicroservice', () => {
    it('should call userService.updateUserData with the correct parameters', async () => {
      const userData = { _id: new Types.ObjectId(), firstName: 'Updated' };
      mockUserService.updateUserData.mockResolvedValue({ acknowledged: true });

      const result = await controller.updateUserMicroservice(userData);

      expect(userService.updateUserData).toHaveBeenCalledWith(userData);
      expect(result).toEqual({ acknowledged: true });
    });
  });

  describe('getManyUsers', () => {
    it('should call userService.getManyUsers with the correct parameters', async () => {
      const body = { ids: ['123', '456'] };
      mockUserService.getManyUsers.mockResolvedValue([mockUser]);

      const result = await controller.getManyUsers(body);

      expect(userService.getManyUsers).toHaveBeenCalledWith(body.ids);
      expect(result).toEqual([mockUser]);
    });
  });
}); 