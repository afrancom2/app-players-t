import type { ValidationError } from 'class-validator';
import type { FieldError } from '../interfaces/api-error-response.interface.js';

// Nombres en español de los campos que conoce la app, SIN artículo (el
// template siempre antepone "El campo", así evitamos errores de concordancia
// de género como "La nacionalidad es obligatorio"). Cualquier campo que no
// esté aquí se humaniza automáticamente a partir de su nombre (ver
// `humanizeField`), así que esta lista no necesita ser exhaustiva.
const FIELD_LABELS: Record<string, string> = {
  nombreCompleto: 'nombre completo',
  nacionalidad: 'nacionalidad',
  fechaNacimiento: 'fecha de nacimiento',
  posicion: 'posición',
  fotoUrl: 'URL de la foto',
  biografia: 'biografía',
  trayectoria: 'trayectoria',
  seleccion: 'selección nacional',
  palmares: 'palmarés',
  estado: 'estado',
  anioRetiro: 'año de retiro',
  clubId: 'club',
  anioInicio: 'año de inicio',
  anioFin: 'año de fin',
  tituloId: 'título',
  cantidad: 'cantidad',
  nombre: 'nombre',
  email: 'correo electrónico',
  password: 'contraseña',
  search: 'búsqueda',
  liga: 'liga',
  equipo: 'equipo',
  page: 'página',
  limit: 'límite de resultados',
};

function humanizeField(leaf: string): string {
  return leaf.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
}

function labelFor(path: string): string {
  const leaf = path.split('.').pop() ?? path;
  const cleanLeaf = leaf.replace(/\[\d+\]$/, '');
  const name = FIELD_LABELS[cleanLeaf] ?? humanizeField(cleanLeaf);
  return `El campo "${name}"`;
}

// Intenta extraer un número del mensaje original de class-validator (en
// inglés) para reutilizarlo en el mensaje en español, ej. "must not be less
// than 1900" -> 1900.
function extractNumber(originalMessage: string): string | null {
  const match = originalMessage.match(/-?\d+(\.\d+)?/);
  return match ? match[0] : null;
}

function translateConstraint(key: string, label: string, originalMessage: string): string {
  switch (key) {
    case 'isNotEmpty':
    case 'arrayNotEmpty':
      return `${label} es obligatorio.`;
    case 'isString':
      return `${label} debe ser un texto.`;
    case 'isEmail':
      return `${label} debe ser un correo electrónico válido.`;
    case 'minLength': {
      const n = extractNumber(originalMessage);
      return n ? `${label} debe tener al menos ${n} caracteres.` : `${label} es demasiado corto.`;
    }
    case 'maxLength': {
      const n = extractNumber(originalMessage);
      return n ? `${label} debe tener como máximo ${n} caracteres.` : `${label} es demasiado largo.`;
    }
    case 'isDateString':
      return `${label} debe ser una fecha válida (AAAA-MM-DD).`;
    case 'isEnum':
      return `${label} tiene un valor no permitido.`;
    case 'isUrl':
      return `${label} debe ser una URL válida.`;
    case 'isArray':
      return `${label} debe ser una lista.`;
    case 'isInt':
      return `${label} debe ser un número entero.`;
    case 'isNumber':
      return `${label} debe ser un número.`;
    case 'isBoolean':
      return `${label} debe ser verdadero o falso.`;
    case 'min': {
      const n = extractNumber(originalMessage);
      return n ? `${label} debe ser mayor o igual a ${n}.` : `${label} no alcanza el valor mínimo permitido.`;
    }
    case 'max': {
      const n = extractNumber(originalMessage);
      return n ? `${label} debe ser menor o igual a ${n}.` : `${label} supera el valor máximo permitido.`;
    }
    default:
      return `${label} no es válido.`;
  }
}

/**
 * Convierte el árbol de errores anidados de class-validator (que incluye un
 * nodo por cada elemento de un array validado con `ValidateNested({ each:
 * true })`, ej. trayectoria[0].clubId) en una lista plana de {field, message}
 * en español, lista para mostrar en la UI.
 */
export function flattenValidationErrors(errors: ValidationError[], parentPath = ''): FieldError[] {
  const result: FieldError[] = [];

  for (const err of errors) {
    const isIndex = /^\d+$/.test(err.property);
    const segment = isIndex ? `[${err.property}]` : parentPath ? `.${err.property}` : err.property;
    const path = `${parentPath}${segment}`;

    if (err.constraints) {
      const label = labelFor(path);
      for (const [key, originalMessage] of Object.entries(err.constraints)) {
        result.push({ field: path, message: translateConstraint(key, label, originalMessage) });
      }
    }

    if (err.children && err.children.length > 0) {
      result.push(...flattenValidationErrors(err.children, path));
    }
  }

  return result;
}
