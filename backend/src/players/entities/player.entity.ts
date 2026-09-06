import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Estado } from '../enums/estado.enum.js';
import { Posicion } from '../enums/posicion.enum.js';
import { Palmares } from './palmares.entity.js';
import { Trayectoria } from './trayectoria.entity.js';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nombre_completo' })
  nombreCompleto!: string;

  @Column()
  nacionalidad!: string;

  @Column({ name: 'fecha_nacimiento', type: 'date' })
  fechaNacimiento!: string;

  @Column({ type: 'enum', enum: Posicion })
  posicion!: Posicion;

  @Column({ name: 'foto_url', nullable: true })
  fotoUrl?: string;

  @Column({ type: 'text', nullable: true })
  biografia?: string;

  @Column({ type: 'enum', enum: Estado })
  estado!: Estado;

  @Column({ name: 'anio_retiro', nullable: true })
  anioRetiro?: number;

  @Column({ name: 'seleccion_nombre', nullable: true })
  seleccionNombre?: string;

  @Column({ name: 'seleccion_anio_inicio', nullable: true })
  seleccionAnioInicio?: number;

  @Column({ name: 'seleccion_anio_fin', nullable: true })
  seleccionAnioFin?: number;

  @OneToMany(() => Trayectoria, (item) => item.player, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  trayectoria!: Relation<Trayectoria>[];

  @OneToMany(() => Palmares, (item) => item.player, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  palmares!: Relation<Palmares>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
