import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ApiAuthenticated,
  ApiNotFound,
  ApiOperationWithDescription,
  ApiServerErrorResponse,
  ApiUuidParam,
  ApiValidationError,
  ForbiddenSwagger,
} from '@/common/swagger';
import type { RequestWithUser } from '@/modules/auth/types/authenticated-user';

import { CreateTaskDto } from './dto/create-task.dto';
import { FindTasksDto } from './dto/find-tasks.dto';
import {
  DeleteTaskResponseDto,
  TaskResponseDto,
} from './dto/task-response.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
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
  findAll(@Req() request: RequestWithUser, @Query() query: FindTasksDto) {
    return this.tasksService.findAll(request.user, query);
  }

  @Patch(':id/status')
  @ApiAuthenticated()
  @ApiOperationWithDescription(tasksDocumentation.updateStatus)
  @ApiUuidParam('id', tasksDocumentation.updateStatus.uuidParamDescription)
  @ApiResponse({
    status: 200,
    description: tasksDocumentation.updateStatus.successDescription,
    type: TaskResponseDto,
  })
  @ApiValidationError(
    tasksDocumentation.updateStatus.validationErrorDescription,
  )
  @ApiResponse({
    status: 403,
    description: tasksDocumentation.updateStatus.forbiddenDescription,
    type: ForbiddenSwagger,
  })
  @ApiNotFound(tasksDocumentation.updateStatus.notFoundDescription)
  @ApiServerErrorResponse()
  updateStatus(
    @Req() request: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(
      request.user,
      id,
      updateTaskStatusDto,
    );
  }

  @Delete(':id')
  @ApiAuthenticated()
  @ApiOperationWithDescription(tasksDocumentation.delete)
  @ApiUuidParam('id', tasksDocumentation.delete.uuidParamDescription)
  @ApiResponse({
    status: 200,
    description: tasksDocumentation.delete.successDescription,
    type: DeleteTaskResponseDto,
  })
  @ApiValidationError(tasksDocumentation.delete.validationErrorDescription)
  @ApiResponse({
    status: 403,
    description: tasksDocumentation.delete.forbiddenDescription,
    type: ForbiddenSwagger,
  })
  @ApiNotFound(tasksDocumentation.delete.notFoundDescription)
  @ApiServerErrorResponse()
  delete(
    @Req() request: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.tasksService.delete(request.user, id);
  }
}
