import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ApiAuthenticated,
  ApiNotFound,
  ApiOperationWithDescription,
  ApiServerErrorResponse,
  ApiValidationError,
  ForbiddenSwagger,
} from '@/common/swagger';
import type { RequestWithUser } from '@/modules/auth/types/authenticated-user';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { tasksDocumentation } from './tasks.documentation';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiAuthenticated()
  @ApiOperationWithDescription(tasksDocumentation.create)
  @ApiResponse({
    status: 201,
    description: tasksDocumentation.create.successDescription,
    type: TaskResponseDto,
  })
  @ApiValidationError()
  @ApiResponse({
    status: 403,
    description: tasksDocumentation.create.forbiddenDescription,
    type: ForbiddenSwagger,
  })
  @ApiNotFound()
  @ApiServerErrorResponse()
  create(
    @Req() request: RequestWithUser,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(request.user, createTaskDto);
  }

  @Get()
  @ApiAuthenticated()
  @ApiOperationWithDescription(tasksDocumentation.findAll)
  @ApiResponse({
    status: 200,
    description: tasksDocumentation.findAll.successDescription,
    type: TaskResponseDto,
    isArray: true,
  })
  @ApiServerErrorResponse()
  findAll(@Req() request: RequestWithUser) {
    return this.tasksService.findAll(request.user);
  }
}
