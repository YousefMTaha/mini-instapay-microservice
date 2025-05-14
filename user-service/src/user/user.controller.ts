import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthorizationGuard } from 'src/guards/Authorization.guard';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { ConfirmChangeEmailDTO } from '../auth/dto/confirm-change-email.dto';
import { BannedUserDTO } from './dto/banned-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { userType } from 'src/user.schema';
import { currentUser } from 'decorators/current-user.decorator';
import { EmailDTO } from 'utils/common/common.dto';
import { userRoles } from 'src/user.constants';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Get user data
   */
  @UseGuards(AuthGuard)
  @Get()
  getUser(@currentUser() user: userType) {
    return this.userService.getUser(user);
  }

  /**
   * Update user data
   */
  @UseGuards(AuthGuard)
  @Patch()
  updateUser(@currentUser() user: userType, @Body() body: UpdateUserDTO) {
    return this.userService.updateUser(user, body);
  }

  /**
   * Change user password
   */
  @UseGuards(AuthGuard)
  @Patch('updatePassword')
  updatePassword(
    @currentUser() userData: userType,
    @Body() body: UpdatePasswordDTO,
  ) {
    return this.userService.updatePassword(userData, body);
  }

  /**
   * Update user email
   */
  @UseGuards(AuthGuard)
  @Post('changeEmail')
  updateEmail(@Body() body: EmailDTO, @currentUser() user: userType) {
    return this.authService.changeMail(user, body.email);
  }

  /**
   * Confirm change email
   */
  @UseGuards(AuthGuard)
  @Patch('confirmChangeEmail')
  confirmChangeEmail(@Body() body: ConfirmChangeEmailDTO) {
    return this.authService.confirmUpdateMail(body.token, body.otp);
  }

  /**
   * Logout user
   */
  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@currentUser() user: userType) {
    return this.userService.logout(user);
  }

  // admin

  /**
   * Get all users
   */
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.Admin))
  @Get('admin')
  getAllUsers() {
    return this.userService.getAll();
  }

  /**
   * Banned user
   */
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.Admin))
  @Post('admin/banned')
  bannedUser(@Body() body: BannedUserDTO) {
    return this.userService.bannedUser(body.userId);
  }

  @UseGuards(AuthGuard)
  @Get('getUserById/:id')
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  // internal-network (for docker)
  @Post('userDataGuard')
  getUserData(@Body('_id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('updateSocketId')
  updateSocketId(@Body() body: any) {
    return this.userService.updateSocketId(body.userId, body.socketId);
  }

  @Post('getAllAdmins')
  getAllAdmins() {
    return this.userService.getAllAdmins();
  }

  // transaction-service
  @Post('findUser')
  findUser(@Body() body: any) {
    return this.userService.findUser(body);
  }

  @Put('updateUserMicroservice')
  async updateUserMicroservice(@Body() userData: any) {
    return this.userService.updateUserData(userData);
  }

  @Post('many-by-ids')
  getManyUsers(@Body() body: any) {
    return this.userService.getManyUsers(body.ids);
  }
}
