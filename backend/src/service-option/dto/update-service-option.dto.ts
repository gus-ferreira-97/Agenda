import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceOptionDto } from '../../service-option/dto/create-service-option.dto';

export class UpdateServiceOptionDto extends PartialType(CreateServiceOptionDto) {}