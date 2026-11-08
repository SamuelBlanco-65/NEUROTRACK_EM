export type AuthErrorClass = 'sin-conexion' | 'credenciales-invalidas' | 'validacion' | 'servidor' | 'inesperado';

export type AuthError = {
  authClass: AuthErrorClass;
  message: string;
};

export type Session = {
  userId: string;
  email: string;
};
