import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
import { UpdateNameUserDto } from './dto/update-name-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('find-by-email')
  findByEmail(@Body() query: FindUserByEmailDto) {
    return this.usersService.findByEmail(query.email);
  }

  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  updateName(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateNameUserDto: UpdateNameUserDto,
  ) {
    return this.usersService.updateName(id, updateNameUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
