import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Chips } from 'primereact/chips';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createPost, fetchPosts, updatePost } from '../features/posts/postsSlice';
import { fetchUsers } from '../features/users/usersSlice';
import { showToast } from '../features/ui/uiSlice';
import type { PostFormData } from '../features/posts/postsTypes';

// Valores por defecto de un formulario vacío (modo "crear").
const emptyValues: PostFormData = { title: '', body: '', userId: 0, tags: [] };

// Longitudes máximas para mantener las publicaciones breves y con buena UX.
const TITLE_MAX = 100;
const BODY_MAX = 500;
const TAGS_MAX = 5; // Número máximo de tags por publicación.
const TAG_TEXT_MAX = 20; // Longitud máxima del texto de cada tag.

export default function PostFormPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Si la URL trae :id, estamos EDITANDO; si no, estamos CREANDO.
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const postId = id ? Number(id) : null;

  const users = useAppSelector((state) => state.users.items);
  const posts = useAppSelector((state) => state.posts.items);
  // Buscamos el post a editar dentro del estado global.
  const existingPost = useAppSelector((state) => state.posts.items.find((p) => p.id === postId));

  // react-hook-form: control (para Controller), reset (para precargar), y estado del envío.
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({ defaultValues: emptyValues });

  // Nos aseguramos de tener usuarios (dropdown) y posts (para poder editar tras un refresco directo).
  useEffect(() => {
    if (users.length === 0) dispatch(fetchUsers());
    if (isEdit && posts.length === 0) dispatch(fetchPosts());
  }, [dispatch, isEdit, users.length, posts.length]);

  // Cuando encontramos el post a editar, precargamos el formulario con sus datos.
  useEffect(() => {
    if (isEdit && existingPost) {
      reset({
        title: existingPost.title,
        body: existingPost.body,
        userId: existingPost.userId,
        tags: existingPost.tags,
      });
    }
  }, [isEdit, existingPost, reset]);

  // Envío del formulario (ya validado por react-hook-form).
  const onSubmit = async (data: PostFormData) => {
    // Despachamos el thunk según el modo y comprobamos si terminó en éxito ("fulfilled").
    let ok = false;
    if (isEdit && postId) {
      // isLocal: si el post se creó en la app, se edita solo en local (sin API).
      const result = await dispatch(updatePost({ id: postId, changes: data, isLocal: existingPost?.isLocal }));
      ok = updatePost.fulfilled.match(result);
    } else {
      const result = await dispatch(createPost(data));
      ok = createPost.fulfilled.match(result);
    }

    if (ok) {
      // Toast GLOBAL: sobrevive al cambio de ruta, así que podemos navegar de inmediato.
      dispatch(
        showToast({
          severity: 'success',
          summary: isEdit ? 'Actualizado' : 'Creado',
          detail: `Publicación ${isEdit ? 'actualizada' : 'creada'} correctamente`,
        }),
      );
      navigate('/');
    } else {
      dispatch(showToast({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' }));
    }
  };

  // Opciones del Dropdown de usuario.
  const userOptions = users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));

  return (
    <div className="flex justify-content-center">
      <Card
        title={isEdit ? 'Editar publicación' : 'Nueva publicación'}
        className="w-full"
        style={{ maxWidth: '40rem' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-3">
          {/* --- Título --- */}
          <div className="flex flex-column gap-2">
            <label htmlFor="title">Título *</label>
            <Controller
              name="title"
              control={control}
              rules={{
                required: 'El título es obligatorio',
                maxLength: { value: TITLE_MAX, message: `Máximo ${TITLE_MAX} caracteres` },
              }}
              render={({ field, fieldState }) => (
                <>
                  <InputText
                    id="title"
                    {...field} // value + onChange que react-hook-form maneja por nosotros.
                    maxLength={TITLE_MAX} // Impide escribir más del límite.
                    className={fieldState.error ? 'p-invalid' : ''}
                  />
                  {/* Contador de caracteres alineado a la derecha */}
                  <small className="text-color-secondary align-self-end">
                    {field.value.length}/{TITLE_MAX}
                  </small>
                </>
              )}
            />
            {errors.title && <small className="p-error">{errors.title.message}</small>}
          </div>

          {/* --- Cuerpo --- */}
          <div className="flex flex-column gap-2">
            <label htmlFor="body">Contenido *</label>
            <Controller
              name="body"
              control={control}
              rules={{
                required: 'El contenido es obligatorio',
                minLength: { value: 10, message: 'Mínimo 10 caracteres' },
                maxLength: { value: BODY_MAX, message: `Máximo ${BODY_MAX} caracteres` },
              }}
              render={({ field, fieldState }) => (
                <>
                  <InputTextarea
                    id="body"
                    rows={5}
                    autoResize
                    {...field}
                    maxLength={BODY_MAX} // Impide escribir más del límite.
                    className={fieldState.error ? 'p-invalid' : ''}
                  />
                  {/* Contador de caracteres alineado a la derecha */}
                  <small className="text-color-secondary align-self-end">
                    {field.value.length}/{BODY_MAX}
                  </small>
                </>
              )}
            />
            {errors.body && <small className="p-error">{errors.body.message}</small>}
          </div>

          {/* --- Usuario (Dropdown) --- */}
          <div className="flex flex-column gap-2">
            <label htmlFor="userId">Autor *</label>
            <Controller
              name="userId"
              control={control}
              rules={{ validate: (v) => v > 0 || 'Selecciona un autor' }} // 0 = sin seleccionar.
              render={({ field, fieldState }) => (
                <Dropdown
                  id="userId"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={userOptions}
                  placeholder="Selecciona un autor"
                  filter
                  className={fieldState.error ? 'p-invalid' : ''}
                />
              )}
            />
            {errors.userId && <small className="p-error">{errors.userId.message}</small>}
          </div>

          {/* --- Tags (Chips) --- */}
          <div className="flex flex-column gap-2">
            <label htmlFor="tags">Tags</label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <>
                  <Chips
                    id="tags"
                    value={field.value}
                    onChange={(e) => field.onChange(e.value ?? [])}
                    max={TAGS_MAX} // Impide añadir más tags del límite.
                    // Limita la longitud del texto de cada tag (input interno).
                    pt={{ input: { maxLength: TAG_TEXT_MAX } }}
                    placeholder="Escribe y pulsa Enter"
                    className="w-full"
                  />
                  {/* Contador de tags alineado a la derecha */}
                  <small className="text-color-secondary align-self-end">
                    {field.value.length}/{TAGS_MAX}
                  </small>
                </>
              )}
            />
            <small className="text-color-secondary">
              Pulsa Enter para añadir cada tag (máx. {TAG_TEXT_MAX} caracteres por tag).
            </small>
          </div>

          {/* --- Botones --- */}
          <div className="flex justify-content-end gap-2 mt-2">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={() => navigate('/')}
            />
            <Button
              type="submit"
              label={isEdit ? 'Guardar cambios' : 'Crear'}
              icon="pi pi-check"
              loading={isSubmitting} // Spinner mientras se envía.
            />
          </div>
        </form>
      </Card>
    </div>
  );
}
