import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Professional } from '../../professional/entities/professional.entity';
import { Service } from '../../service/entities/service.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { AuditLog } from '../../audit-log/entities/audit-log.entity';
import { TenantConfig } from './tenant-config.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  subdomain: string;

  @Column({ length: 20, default: 'ativo' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Professional, (professional) => professional.tenant)
  professionals: Professional[];

  @OneToMany(() => Service, (service) => service.tenant)
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.tenant)
  appointments: Appointment[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.tenant)
  auditLogs: AuditLog[];

  @OneToOne(() => TenantConfig, (config) => config.tenant)
  config: TenantConfig;
}