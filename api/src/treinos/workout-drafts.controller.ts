import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { IsInt, IsObject, IsString, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkoutAdminGuard } from './workout-admin.guard';
import { WorkoutDraftsService } from './workout-drafts.service';

export class SaveWorkoutDraftDto {
  @IsInt() @Min(0) revision: number;
  @IsString() baseVersion: string;
  @IsObject() payload: any;
}
export class PublishWorkoutDraftDto {
  @IsInt() @Min(1) revision: number;
}

@Controller('workout-drafts')
@UseGuards(JwtAuthGuard, WorkoutAdminGuard)
export class WorkoutDraftsController {
  constructor(private readonly drafts: WorkoutDraftsService) {}
  @Get(':type') list(@Param('type') type: string) { return this.drafts.list(type); }
  @Get(':type/:id') get(@Param('type') type: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.drafts.get(type, id);
  }
  @Put(':type/:id') save(@Param('type') type: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: SaveWorkoutDraftDto) {
    return this.drafts.save(type, id, body);
  }
  @Post(':type/:id/publish') publish(@Param('type') type: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: PublishWorkoutDraftDto) {
    return this.drafts.publish(type, id, body.revision);
  }
  @Delete(':type/:id') discard(@Param('type') type: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: PublishWorkoutDraftDto) {
    return this.drafts.discard(type, id, body.revision);
  }
}
