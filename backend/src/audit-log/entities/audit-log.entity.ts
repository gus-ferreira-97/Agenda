import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { User } from '../../user/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  tenant_id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.auditLogs, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100 })
  entity: string;

  @Column({ type: 'int' })
  entity_id: number;

  @CreateDateColumn()
  timestamp: Date;
}