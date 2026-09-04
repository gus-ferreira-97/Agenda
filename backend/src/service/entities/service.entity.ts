import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { ProfessionalService } from './professional-service.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  tenant_id: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.services)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  duration_minutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProfessionalService, (ps) => ps.service)
  professionalServices: ProfessionalService[];

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];
}