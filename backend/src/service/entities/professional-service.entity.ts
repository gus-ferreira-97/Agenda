import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Professional } from '../../professional/entities/professional.entity';
import { Service } from './service.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('professional_services')
export class ProfessionalService {
  @PrimaryColumn()
  professional_id: number;

  @PrimaryColumn()
  service_id: number;

  @Column({ type: 'int' })
  tenant_id: number;

  @ManyToOne(() => Professional, (professional) => professional.professionalServices)
  @JoinColumn({ name: 'professional_id' })
  professional: Professional;

  @ManyToOne(() => Service, (service) => service.professionalServices)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}