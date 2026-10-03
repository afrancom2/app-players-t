import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { League } from './league.entity.js';

/**
 * Un título pertenece a una liga (títulos nacionales de clubes) o a un grupo
 * (títulos internacionales por organizador, o "SELECCIONES"); nunca a ambos.
 */
@Entity('titles')
export class Title {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  nombre!: string;

  @Column({ name: 'liga_id', type: 'int', nullable: true })
  ligaId!: number | null;

  @ManyToOne(() => League, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'liga_id' })
  liga?: Relation<League> | null;

  @Column({ type: 'varchar', nullable: true })
  grupo!: string | null;

  /** Orden de aparición dentro de su liga o grupo (liga primero, luego copas). */
  @Column({ type: 'int', default: 0 })
  orden!: number;
}
