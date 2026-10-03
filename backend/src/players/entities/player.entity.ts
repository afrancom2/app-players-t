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

  // Los opcionales admiten null: TypeORM ignora `undefined` al guardar, así
  // que para vaciar un campo existente hay que asignarle null explícitamente.
  @Column({ name: 'foto_url', type: 'varchar', nullable: true })
  fotoUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  biografia?: string | null;

  @Column({ type: 'enum', enum: Estado })
  estado!: Estado;

  @Column({ name: 'anio_retiro', type: 'int', nullable: true })
  anioRetiro?: number | null;

  @Column({ name: 'seleccion_nombre', type: 'varchar', nullable: true })
  seleccionNombre?: string | null;

  @Column({ name: 'seleccion_anio_inicio', type: 'int', nullable: true })
  seleccionAnioInicio?: number | null;

  @Column({ name: 'seleccion_anio_fin', type: 'int', nullable: true })
  seleccionAnioFin?: number | null;

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
