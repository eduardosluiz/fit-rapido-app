import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('workout_drafts')
@Unique(['content_type', 'content_id'])
export class WorkoutDraft {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() content_type: string;
  @Column('uuid') content_id: string;
  @Column('jsonb') payload: any;
  @Column({ default: 1 }) revision: number;
  @Column({ type: 'timestamptz', nullable: true }) base_published_updated_at: Date;
  @CreateDateColumn({ type: 'timestamptz' }) created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updated_at: Date;
}
