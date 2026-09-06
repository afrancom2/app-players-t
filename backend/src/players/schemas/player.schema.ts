import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Estado } from '../enums/estado.enum.js';
import { Posicion } from '../enums/posicion.enum.js';

export type PlayerDocument = HydratedDocument<Player>;

@Schema({ _id: false })
export class TrayectoriaItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team', required: true })
  clubId!: Types.ObjectId;

  @Prop({ required: true })
  anioInicio!: number;

  @Prop()
  anioFin?: number;
}
export const TrayectoriaItemSchema = SchemaFactory.createForClass(TrayectoriaItem);

@Schema({ _id: false })
export class Seleccion {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ required: true })
  anioInicio!: number;

  @Prop()
  anioFin?: number;
}
export const SeleccionSchema = SchemaFactory.createForClass(Seleccion);

@Schema({ _id: false })
export class PalmaresItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Title', required: true })
  tituloId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  cantidad!: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  clubId?: Types.ObjectId;
}
export const PalmaresItemSchema = SchemaFactory.createForClass(PalmaresItem);

@Schema({ timestamps: true })
export class Player {
  @Prop({ required: true, trim: true })
  nombreCompleto!: string;

  @Prop({ required: true, trim: true })
  nacionalidad!: string;

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop({ type: String, required: true, enum: Posicion })
  posicion!: Posicion;

  @Prop({ trim: true })
  fotoUrl?: string;

  @Prop({ trim: true })
  biografia?: string;

  @Prop({ type: [TrayectoriaItemSchema], default: [] })
  trayectoria!: TrayectoriaItem[];

  @Prop({ type: SeleccionSchema })
  seleccion?: Seleccion;

  @Prop({ type: [PalmaresItemSchema], default: [] })
  palmares!: PalmaresItem[];

  @Prop({ type: String, required: true, enum: Estado })
  estado!: Estado;

  @Prop()
  anioRetiro?: number;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
PlayerSchema.index({ 'trayectoria.clubId': 1 });
PlayerSchema.index({ posicion: 1 });
PlayerSchema.index({ estado: 1 });
PlayerSchema.index({ nombreCompleto: 1 }, { collation: { locale: 'es', strength: 1 } });
