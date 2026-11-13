import { getOrCreatePatientInvite } from '../api';

// Los nombres empiezan con «mock» para que jest permita usarlos dentro de la fábrica (que se eleva al inicio).
const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

const fila = {
  id: 'link-1',
  patient_id: 'p-1',
  caregiver_id: null,
  caregiver_email: null,
  caregiver_name: null,
  patient_name: null,
  invite_code: 'ABCD2345',
  status: 'pendiente',
  share_sintomas: true,
  share_progreso: true,
  share_recordatorios: true,
  created_at: '2026-11-11T00:00:00Z',
  responded_at: null,
};

describe('getOrCreatePatientInvite', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockFrom.mockReset();
  });

  test('pide la invitación al servidor y nunca elige el código ni inserta en la tabla', async () => {
    mockRpc.mockResolvedValue({ data: fila, error: null });

    const link = await getOrCreatePatientInvite();

    expect(mockRpc).toHaveBeenCalledWith('create_caregiver_invite');
    expect(mockFrom).not.toHaveBeenCalled();
    expect(link.inviteCode).toBe('ABCD2345');
    expect(link.status).toBe('pendiente');
  });

  test('acepta que la función devuelva un arreglo', async () => {
    mockRpc.mockResolvedValue({ data: [fila], error: null });
    await expect(getOrCreatePatientInvite()).resolves.toMatchObject({ id: 'link-1' });
  });

  test('traduce un error del servidor a un mensaje en español', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'x' } });
    await expect(getOrCreatePatientInvite()).rejects.toMatchObject({ errorClass: 'validacion' });
  });

  test('si el servidor no devuelve nada, falla con un error controlado', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    await expect(getOrCreatePatientInvite()).rejects.toMatchObject({ errorClass: 'codigo-invalido' });
  });
});
