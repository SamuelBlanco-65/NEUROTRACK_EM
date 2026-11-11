export type AuthErrorClass =
  | 'sin-conexion'
  | 'credenciales-invalidas'
  | 'correo-sin-confirmar'
  | 'validacion'
  | 'servidor'
  | 'inesperado';

export type AuthError = {
  authClass: AuthErrorClass;
  message: string;
};

export type Session = {
  userId: string;
  email: string;
  /** `full_name` guardado al crear la cuenta; puede faltar en cuentas antiguas. */
  name: string | null;
};
