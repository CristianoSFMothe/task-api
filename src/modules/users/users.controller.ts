import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
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

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
