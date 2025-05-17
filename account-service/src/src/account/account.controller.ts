import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { AddAccountDTO } from './dto/add-account.dto';
import { UpdateLimitDTO } from './dto/update-amount.dto';
import { UpdatePinDTO } from './dto/update-PIN.dto';
import { ForgetPinDTO } from './dto/forget-PIN.dto';
import { SharedAuthGuard } from '../guards/auth.guard';
import { CardService } from '../card/card.service';
import { currentUser } from '../decorators/current-user.decorator';
import {
  TokenAndOTPDTO,
  TokenDTO,
  ObjectIdDTO,
  PINDTO,
} from 'src/utils/common/common.dto';
import { EAccountType } from 'src/utils/Constants/system.constants';
import { GetAccountByIdDTO } from './dto/get-account-by-id.dto';
import { CheckDefaultAccDTO } from './dto/check-default-acc.dto';
import { CheckPinDTO } from './dto/check-pin.dto';
import { CheckLimitDTO } from './dto/check-limit.dto';
import { GetAccountDTO } from './dto/get-account.dto';
import { UpdateAccountDTO } from './dto/update-account.dto';
import { GetManyAccountsDTO } from './dto/get-many-accounts.dto';
import { GetUserAccountsDTO } from './dto/get-user-accounts.dto';
import { userType } from '../schemas/user.schema';
import { accountType } from '../schemas/account.schema';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly cardService: CardService,
  ) {}

  /**
   * Get all accounts for the current user.
   * Data from current user is passed as an argument.
   */
  @UseGuards(SharedAuthGuard)
  @Get()
  getAllAccounts(@currentUser() user: userType) {
    return this.accountService.getAllAccounts(user);
  }

  /**
   * Get the default account for the current user.
   * Data from current user is passed as an argument.
   */
  @UseGuards(SharedAuthGuard)
  @Get('defaultAcc')
  getDefault(@currentUser() user: userType) {
    return this.accountService.getDefault(user);
  }

  /**
   * Reset the number of tries for PIN verification.
   * The token is passed from the URL parameters.
   */
  @UseGuards(SharedAuthGuard)
  @Get('verifyAccountUser/:token')
  @SetMetadata('skipAuth', true) // Don't apply AuthGuard on this API
  resetTries(@Param() param: TokenDTO) {
    return this.accountService.resetTries(param.token);
  }

  /**
   * Get the balance of a specific account.
   * Requires accountId from URL parameters and PIN from request body.
   */
  @UseGuards(SharedAuthGuard)
  @Post('balance/:id')
  async getBalance(
    @currentUser() user: userType,
    @Param() param: ObjectIdDTO,
    @Body() body: PINDTO,
  ) {
    const account = await this.accountService.getAccount(param.id);
    await this.accountService.checkPIN(user, account, body.PIN);
    return {
      message: 'done',
      status: true,
      data: account.Balance,
    };
  }

  /**
   * Add a new account for the current user.
   * Requires card information and user details from request body and current user.
   */
  @UseGuards(SharedAuthGuard)
  @Post()
  async add(@Body() body: AddAccountDTO, @currentUser() user: userType) {
    await this.cardService.checkCardExist(body.cardNo);
    const card = await this.cardService.addCard(body);
    return this.accountService.addAccount(body, user, card.data);
  }

  /**
   * Update the limit of a specific account.
   * Requires accountId from URL parameters and limit details from request body.
   */
  @UseGuards(SharedAuthGuard)
  @Patch('limit/:id')
  async updateLimit(
    @currentUser() user: userType,
    @Body() body: UpdateLimitDTO,
    @Param() param: ObjectIdDTO,
  ) {
    const account = await this.accountService.getAccountById(
      user._id,
      param.id,
      EAccountType.OWNER,
    );
    return this.accountService.updateLimit(account, body);
  }

  /**
   * Update the PIN of a specific account.
   * Requires accountId from URL parameters and old/new PINs from request body.
   */
  @UseGuards(SharedAuthGuard)
  @Patch('PIN/:id')
  async updatePIN(
    @Body() body: UpdatePinDTO,
    @Param() param: ObjectIdDTO,
    @currentUser() user: userType,
  ) {
    const account = await this.accountService.getAccountById(
      user._id,
      param.id,
      EAccountType.OWNER,
    );
    await this.accountService.checkPIN(user, account, body.oldPIN);
    return this.accountService.updatePIN(body, account);
  }

  /**
   * Delete a specific account.
   * Requires accountId from URL parameters and PIN from request body.
   */
  @UseGuards(SharedAuthGuard)
  @Delete(':id')
  async delete(
    @Body() body: PINDTO,
    @currentUser() user: userType,
    @Param() param: ObjectIdDTO,
  ) {
    const account = await this.accountService.getAccount(param.id);
    await this.accountService.checkPIN(user, account, body.PIN);
    return this.accountService.deleteAccount(user, account);
  }

  /**
   * Send OTP for forgetting PIN.
   * Requires accountId from URL parameters.
   */
  @UseGuards(SharedAuthGuard)
  @Post('sendForgetPINOTP/:id')
  async sendOTP(@currentUser() user: userType, @Param() param: ObjectIdDTO) {
    const account = await this.accountService.getAccountById(
      user._id,
      param.id,
      EAccountType.OWNER,
    );
    return this.accountService.forgetOTPMail(user, account);
  }

  /**
   * Confirm OTP for forgetting PIN.
   * Requires token and OTP from request body.
   */
  @UseGuards(SharedAuthGuard)
  @Post('confirmOTPforgetPIN')
  async confirmOTPforgetPIN(
    @currentUser() user: userType,
    @Body() body: TokenAndOTPDTO,
  ) {
    return this.accountService.confirmOTPForgetPIN(body.token, user, body.otp);
  }

  /**
   * Forget PIN and set a new one.
   * Requires token and new PIN from request body.
   */
  @UseGuards(SharedAuthGuard)
  @Patch('forgetPIN')
  forgetPIN(@currentUser() user: userType, @Body() body: ForgetPinDTO) {
    return this.accountService.forgetPIN(user, body.token, body.PIN);
  }

  // internal-network (for docker)

  @Post('getAccountById')
  getAccountById(@Body() body: GetAccountByIdDTO) {
    return this.accountService.getAccountById(
      body.userId,
      body.accountId,
      body.errMsg,
    );
  }

  @Post('checkDefaultAcc')
  checkDefaultAcc(@Body() body: CheckDefaultAccDTO) {
    return this.accountService.checkDefaultAcc(
      body.user as userType,
      body.errMsg,
    );
  }

  @Post('checkPIN')
  checkPIN(@Body() body: CheckPinDTO) {
    return this.accountService.checkPIN(
      body.user as userType,
      body.account as accountType,
      body.pin,
    );
  }

  @Post('checkLimit')
  checkLimit(@Body() body: CheckLimitDTO) {
    return this.accountService.checkLimit(
      body.amount,
      body.account as accountType,
    );
  }

  @Post('getAccount')
  getAccount(@Body() body: GetAccountDTO) {
    return this.accountService.getAccount(body.accountId);
  }

  @Put('updateAccount')
  updateAccount(@Body() body: UpdateAccountDTO) {
    return this.accountService.updateAccount(body);
  }

  @Post('many-by-ids')
  getManyAccounts(@Body() body: GetManyAccountsDTO) {
    return this.accountService.getManyAccounts(body.ids);
  }

  @Post('user-accounts')
  getUserAccounts(@Body() body: GetUserAccountsDTO) {
    return this.accountService.getUserAccounts(body.userId);
  }
}
