import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Car from './Car';

@Entity('car_item')
export class CarItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Car, (car: Car) => car.items, {
    eager: true,
    orphanedRowAction: 'delete',
  })
  car: Car;
}

export default CarItem;
