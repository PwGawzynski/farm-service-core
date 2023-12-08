import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/updatePassword-dto';
import { User } from './entities/user.entity';
import { GetUser } from '../../decorators/user.decorator';
import { AllRoles, Public } from '../../decorators/auth.decorators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * serves register new User requests
   * @param data -- data specified in CreateUserDto DTO
   * @return ResponseObject with ResponseCode.ProcessedCorrect if operation went correct
   */
  @Post()
  @Public()
  register(@Body() data: CreateUserDto) {
    return this.userService.register(data);
  }

  /**
   * Serves Update user's password ask
   * @param updatePasswordData DTO object to specify JSON ask body
   * @param user -- req causer (userEntity from db)
   * @return ResponseObject with ResponseCode.ProcessedCorrect if operation went correct
   */
  @Put()
  @AllRoles()
  updatePassword(
    @Body() updatePasswordData: UpdatePasswordDto,
    @GetUser() user: User,
  ) {
    return this.userService.updatePassword(updatePasswordData, user);
  }

  /**
   * Serves delete user's account ask
   * @param user -- req causer ( userEntity from db )
   * @return ResponseObject with ResponseCode.ProcessedCorrect if operation went correct
   */
  @Delete()
  @AllRoles()
  deleteAccount(@GetUser() user: User) {
    return this.userService.deleteAccount(user);
  }

  @Get('exist/:userIdentifier')
  @AllRoles()
  checkIfUserExist(@Param('userIdentifier') userIdentifier: string) {
    return this.userService.checkIfUserExist(userIdentifier);
  }

  @Get('activate/:code')
  @Public()
  async activate(@Param(':code') code: string) {
    return this.userService.activate(code);
  }
}
