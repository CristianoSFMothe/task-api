import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ApiAdminAccess,
  ApiAuthenticated,
  ApiNotFound,
  ApiOperationWithDescription,
  ApiServerErrorResponse,
  ApiUuidParam,
  ApiValidationError,
  ConflictSwagger,
} from '@/common/swagger';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import type { RequestWithUser } from '@/modules/auth/types/authenticated-user';

import { CreateUserDto } from './dto/create-user.dto';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
import { FindUserByNameDto } from './dto/find-user-by-name.dto';
import { UpdateNameUserDto } from './dto/update-name-user.dto';
import {
  DeleteUserResponseDto,
  UpdateUserStatusResponseDto,
  UserResponseDto,
  UserWithTasksResponseDto,
} from './dto/user-response.dto';
import { usersDocumentation } from './users.documentation';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @Get()
  @ApiAuthenticated()
  @ApiOperationWithDescription(usersDocumentation.findAll)
  @ApiResponse({
    status: 200,
    description: usersDocumentation.findAll.successDescription,
    type: UserWithTasksResponseDto,
    isArray: true,
  })
  @ApiAdminAccess()
  @ApiServerErrorResponse()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('find-by-email')
  @ApiAuthenticated()
  @ApiOperationWithDescription(usersDocumentation.findByEmail)
  @ApiResponse({
    status: 200,
    description: usersDocumentation.findByEmail.successDescription,
    type: UserWithTasksResponseDto,
  })
  @ApiValidationError()
  @ApiNotFound()
  @ApiServerErrorResponse()
  findByEmail(@Body() query: FindUserByEmailDto) {
    return this.usersService.findByEmail(query.email);
  }

  @Post('find-by-name')
  @ApiAuthenticated()
  @ApiOperationWithDescription(usersDocumentation.findByName)
  @ApiResponse({
    status: 200,
    description: usersDocumentation.findByName.successDescription,
    type: UserWithTasksResponseDto,
    isArray: true,
  })
  @ApiValidationError()
  @ApiNotFound()
  @ApiServerErrorResponse()
  findByName(@Body() query: FindUserByNameDto) {
    return this.usersService.findByName(query.name);
  }

  @Get('me')
  @ApiAuthenticated()
  @ApiOperationWithDescription(usersDocumentation.findMe)
  @ApiResponse({
    status: 200,
    description: usersDocumentation.findMe.successDescription,
    type: UserWithTasksResponseDto,
  })
  @ApiServerErrorResponse()
  findMe(@Req() request: RequestWithUser) {
    return this.usersService.findById(request.user.userId);
  }

  @Patch('me')
  @ApiAuthenticated()
  @ApiOperationWithDescription(usersDocumentation.updateMyName)
  @ApiResponse({
    status: 200,
    description: usersDocumentation.updateMyName.successDescription,
    type: UserResponseDto,
  })
  @ApiValidationError()
  @ApiNotFound()
  @ApiServerErrorResponse()
  updateMyName(
    @Req() request: RequestWithUser,
    @Body() updateNameUserDto: UpdateNameUserDto,
  ) {
    return this.usersService.updateName(request.user.userId, updateNameUserDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiAuthenticated()
  @ApiOperationWithDescription(usersDocumentation.updateStatus)
  @ApiUuidParam('id', usersDocumentation.updateStatus.uuidParamDescription)
  @ApiResponse({
    status: 200,
    description: usersDocumentation.updateStatus.successDescription,
    type: UpdateUserStatusResponseDto,
  })
  @ApiValidationError(
    usersDocumentation.updateStatus.validationErrorDescription,
  )
  @ApiAdminAccess()
  @ApiNotFound()
  @ApiServerErrorResponse()
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.updateStatus(id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiAuthenticated()
  @ApiOperationWithDescription(usersDocumentation.delete)
  @ApiUuidParam('id', usersDocumentation.delete.uuidParamDescription)
  @ApiResponse({
    status: 200,
    description: usersDocumentation.delete.successDescription,
    type: DeleteUserResponseDto,
  })
  @ApiValidationError(usersDocumentation.delete.validationErrorDescription)
  @ApiAdminAccess()
  @ApiNotFound()
  @ApiServerErrorResponse()
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.delete(id);
  }

  @Public()
  @Post()
  @ApiOperationWithDescription(usersDocumentation.create)
  @ApiResponse({
    status: 201,
    description: usersDocumentation.create.successDescription,
    type: UserResponseDto,
  })
  @ApiValidationError()
  @ApiResponse({
    status: 409,
    description: usersDocumentation.create.conflictDescription,
    type: ConflictSwagger,
  })
  @ApiServerErrorResponse()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
