import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelector from '../components/LanguageSelector';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import type { LoginCredentials } from '../features/auth/authTypes';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // Para redirigir programáticamente tras el login.
  const { t } = useTranslation();

  // Leemos del estado global el token, el estado de la petición y el error.
  const { token, status, error } = useAppSelector((state) => state.auth);

  // react-hook-form: usamos "control" (para Controller), porque los componentes de
  // PrimeReact no son inputs nativos y "register" no los conecta correctamente.
  const {
    control,
    handleSubmit, // Envuelve nuestro onSubmit y dispara la validación antes.
    formState: { errors }, // Errores de validación por campo.
  } = useForm<LoginCredentials>({
    // Valores por defecto: DummyJSON actualizó sus usuarios; "emilys" es el válido hoy.
    defaultValues: { username: 'emilys', password: 'emilyspass' },
  });

  // Si ya hay token (login exitoso o sesión previa), redirigimos al panel principal.
  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  // Si el login falla, mostramos un Toast de error (global, vía Redux).
  useEffect(() => {
    if (status === 'failed' && error) {
      dispatch(showToast({ severity: 'error', summary: t('common.error'), detail: error }));
    }
  }, [status, error, dispatch, t]);

  // Función que se ejecuta al enviar el formulario (ya validado).
  const onSubmit = (data: LoginCredentials) => {
    dispatch(login(data)); // Despachamos el thunk de login con las credenciales.
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground p-3">
      {/* Selector de idioma + toggle de tema fijos en la esquina superior derecha */}
      <div
        className="absolute flex align-items-center gap-2"
        style={{ top: '1rem', right: '1rem' }}
      >
        <LanguageSelector />
        <ThemeToggle tooltipPosition="left" />
      </div>
      <Card title={t('login.title')} className="w-full" style={{ maxWidth: '25rem' }}>
        {/* handleSubmit valida y, si todo es correcto, llama a onSubmit */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-3">
          {/* Campo Usuario */}
          <div className="flex flex-column gap-2">
            <label htmlFor="username">{t('login.username')}</label>
            <Controller
              name="username"
              control={control}
              rules={{ required: t('login.usernameRequired') }} // Regla de validación.
              render={({ field, fieldState }) => (
                <InputText
                  id="username"
                  placeholder={t('login.username')}
                  {...field} // value + onChange manejados por react-hook-form.
                  className={`w-full ${fieldState.error ? 'p-invalid' : ''}`}
                  aria-invalid={fieldState.error ? 'true' : 'false'}
                />
              )}
            />
            {/* Mensaje de error de validación del campo usuario */}
            {errors.username && <small className="p-error">{errors.username.message}</small>}
          </div>

          {/* Campo Contraseña */}
          <div className="flex flex-column gap-2">
            <label htmlFor="password">{t('login.password')}</label>
            <Controller
              name="password"
              control={control}
              rules={{ required: t('login.passwordRequired') }}
              render={({ field, fieldState }) => (
                <Password
                  id="password"
                  placeholder={t('login.password')}
                  feedback={false} // Ocultamos el medidor de fuerza (no aplica para login).
                  toggleMask // Botón para mostrar/ocultar la contraseña.
                  inputClassName="w-full"
                  className="w-full"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  aria-invalid={fieldState.error ? 'true' : 'false'}
                />
              )}
            />
            {errors.password && <small className="p-error">{errors.password.message}</small>}
          </div>

          {/* Error global del login (credenciales inválidas) */}
          {status === 'failed' && error && <Message severity="error" text={error} />}

          {/* Botón de envío: muestra spinner mientras status === 'loading' */}
          <Button
            type="submit"
            label={t('login.submit')}
            icon="pi pi-sign-in"
            loading={status === 'loading'}
            className="mt-2"
          />
        </form>
      </Card>
    </div>
  );
}
