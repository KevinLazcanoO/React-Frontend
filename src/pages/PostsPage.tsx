import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { FilterMatchMode } from 'primereact/api';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { deletePost, fetchPosts } from '../features/posts/postsSlice';
import { fetchUsers } from '../features/users/usersSlice';
import { showToast } from '../features/ui/uiSlice';
import type { Post } from '../features/posts/postsTypes';

// Modelo de fila "enriquecido": añadimos campos derivados para mostrar y buscar cómodamente.
interface PostRow extends Post {
  userName: string; // Nombre del autor (resuelto desde el slice de usuarios).
  tagsString: string; // Tags como texto plano (para que la búsqueda global los encuentre).
  reactionsTotal: number; // Suma de likes + dislikes.
}

export default function PostsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Leemos posts y usuarios del estado global.
  const { items: posts, status, error } = useAppSelector((state) => state.posts);
  const users = useAppSelector((state) => state.users.items);

  // Estado local de los filtros de la tabla.
  const [globalValue, setGlobalValue] = useState(''); // Texto de búsqueda global.
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null); // Filtro por usuario.
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Filtro por tags.
  const [viewPost, setViewPost] = useState<PostRow | null>(null); // Post mostrado en el Dialog "Ver".

  // PrimeReact usa este objeto para la búsqueda global (matchMode CONTAINS = "contiene").
  const filters = { global: { value: globalValue, matchMode: FilterMatchMode.CONTAINS } };

  // Cargamos del servidor SOLO la primera vez (status 'idle'). Así, al volver del formulario
  // no re-consultamos y conservamos los cambios locales (altas/bajas/ediciones) en pantalla.
  useEffect(() => {
    if (status === 'idle') dispatch(fetchPosts());
    if (users.length === 0) dispatch(fetchUsers());
  }, [dispatch, status, users.length]);

  // Diccionario id -> "Nombre Apellido" para resolver el autor en O(1).
  const userMap = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((u) => map.set(u.id, `${u.firstName} ${u.lastName}`));
    return map;
  }, [users]);

  // Enriquecemos cada post con los campos derivados.
  const rows = useMemo<PostRow[]>(() => {
    return posts.map((p) => {
      const total = typeof p.reactions === 'number' ? p.reactions : p.reactions.likes + p.reactions.dislikes;
      return {
        ...p,
        userName: userMap.get(p.userId) ?? `Usuario ${p.userId}`,
        tagsString: p.tags.join(' '),
        reactionsTotal: total,
      };
    });
  }, [posts, userMap]);

  // Opciones únicas de tags para el MultiSelect (ordenadas alfabéticamente).
  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [...set].sort().map((t) => ({ label: t, value: t }));
  }, [posts]);

  // Aplicamos los filtros de usuario y tags (la búsqueda global la resuelve el DataTable).
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (selectedUserId !== null && row.userId !== selectedUserId) return false; // Filtro por autor.
      if (selectedTags.length > 0 && !selectedTags.some((t) => row.tags.includes(t))) return false; // Filtro por tags (OR).
      return true;
    });
  }, [rows, selectedUserId, selectedTags]);

  // Limpia todos los filtros de golpe.
  const clearFilters = () => {
    setGlobalValue('');
    setSelectedUserId(null);
    setSelectedTags([]);
  };

  // --- Acciones de fila ---

  // "Ver": abre el Dialog con el detalle del post.
  const onView = (row: PostRow) => setViewPost(row);

  // "Editar": navega al formulario en modo edición con el id del post.
  const onEdit = (row: PostRow) => navigate(`/posts/${row.id}/edit`);

  // "Eliminar": pide confirmación y, si acepta, despacha el thunk de borrado.
  const onDelete = (row: PostRow) => {
    confirmDialog({
      message: `¿Eliminar la publicación "${row.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        // Pasamos isLocal para que los posts creados en la app se borren sin llamar a la API.
        const result = await dispatch(deletePost({ id: row.id, isLocal: row.isLocal }));
        if (deletePost.fulfilled.match(result)) {
          dispatch(showToast({ severity: 'success', summary: 'Eliminado', detail: 'Publicación eliminada' }));
        } else {
          dispatch(showToast({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' }));
        }
      },
    });
  };

  // --- Plantillas de columnas (cómo se renderiza cada celda) ---

  // Columna Tags: muestra cada tag como un chip.
  const tagsBody = (row: PostRow) => (
    <div className="flex flex-wrap gap-1">
      {row.tags.map((t) => (
        <Tag key={t} value={t} rounded />
      ))}
    </div>
  );

  // Columna Reacciones: likes 👍 y dislikes 👎.
  const reactionsBody = (row: PostRow) => {
    const likes = typeof row.reactions === 'number' ? row.reactions : row.reactions.likes;
    const dislikes = typeof row.reactions === 'number' ? 0 : row.reactions.dislikes;
    return (
      <span className="white-space-nowrap">
        <i className="pi pi-thumbs-up text-green-500 mr-1" />
        {likes}
        <i className="pi pi-thumbs-down text-red-500 ml-3 mr-1" />
        {dislikes}
      </span>
    );
  };

  // Columna Acciones: botones Ver / Editar / Eliminar.
  // Opciones comunes del tooltip: posición "arriba" para que no se salga por el borde derecho.
  const tooltipTop = { position: 'top' as const };
  const actionsBody = (row: PostRow) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        rounded
        text
        severity="info"
        aria-label="Ver"
        tooltip="Ver"
        tooltipOptions={tooltipTop}
        onClick={() => onView(row)}
      />
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="warning"
        aria-label="Editar"
        tooltip="Editar"
        tooltipOptions={tooltipTop}
        onClick={() => onEdit(row)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        aria-label="Eliminar"
        tooltip="Eliminar"
        tooltipOptions={tooltipTop}
        onClick={() => onDelete(row)}
      />
    </div>
  );

  // Barra de herramientas: título + botón "Nueva publicación" (Punto 3).
  const toolbarStart = <span className="text-lg font-semibold">Listado de publicaciones</span>;
  const toolbarEnd = (
    <Button label="Nueva publicación" icon="pi pi-plus" onClick={() => navigate('/posts/new')} />
  );

  // Cabecera de la tabla: búsqueda global + filtros + limpiar.
  const tableHeader = (
    <div className="flex flex-column md:flex-row gap-3 md:align-items-center justify-content-between">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalValue}
          onChange={(e) => setGlobalValue(e.target.value)}
          placeholder="Buscar título, autor o tag..."
          className="w-full"
        />
      </span>
      <div className="flex flex-column sm:flex-row gap-2">
        <Dropdown
          value={selectedUserId}
          options={users.map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))}
          onChange={(e) => setSelectedUserId(e.value)}
          placeholder="Filtrar por usuario"
          showClear
          filter
          className="w-full sm:w-14rem"
        />
        <MultiSelect
          value={selectedTags}
          options={tagOptions}
          onChange={(e) => setSelectedTags(e.value)}
          placeholder="Filtrar por tags"
          maxSelectedLabels={2}
          showClear
          className="w-full sm:w-14rem"
        />
        <Button icon="pi pi-filter-slash" label="Limpiar" outlined onClick={clearFilters} />
      </div>
    </div>
  );

  return (
    <div>
      {/* ConfirmDialog "invisible" que se controla con la función confirmDialog() */}
      <ConfirmDialog />

      <Toolbar start={toolbarStart} end={toolbarEnd} className="mb-3" />

      {/* Si la carga falló, mostramos un mensaje de error accesible */}
      {status === 'failed' && (
        <Message severity="error" text={error ?? 'Error al cargar'} className="mb-3 w-full" />
      )}

      <DataTable
        value={filteredRows}
        header={tableHeader}
        loading={status === 'loading'} // Overlay de carga mientras se piden los datos.
        dataKey="id"
        paginator // Activa la paginación.
        rows={10} // Filas por página.
        rowsPerPageOptions={[10, 20, 50]} // Opciones de tamaño de página.
        filters={filters} // Objeto que controla la búsqueda global.
        globalFilterFields={['title', 'userName', 'tagsString']} // Campos sobre los que busca.
        emptyMessage="No se encontraron publicaciones." // Mensaje cuando no hay resultados.
        stripedRows
        removableSort
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="{first}-{last} de {totalRecords}"
      >
        <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
        <Column field="title" header="Título" sortable />
        <Column field="userName" header="Usuario" sortable style={{ minWidth: '10rem' }} />
        <Column header="Tags" body={tagsBody} style={{ minWidth: '12rem' }} />
        <Column
          field="reactionsTotal"
          header="Reacciones"
          body={reactionsBody}
          sortable
          style={{ minWidth: '9rem' }}
        />
        <Column header="Acciones" body={actionsBody} style={{ width: '11rem' }} />
      </DataTable>

      {/* Dialog de "Ver": muestra el detalle completo del post seleccionado */}
      <Dialog
        header={viewPost?.title}
        visible={viewPost !== null}
        style={{ width: '32rem' }}
        onHide={() => setViewPost(null)}
        dismissableMask
      >
        {viewPost && (
          <div className="flex flex-column gap-3">
            <p className="m-0">{viewPost.body}</p>
            <div className="flex flex-wrap gap-1">
              {viewPost.tags.map((t) => (
                <Tag key={t} value={t} rounded />
              ))}
            </div>
            <small className="text-color-secondary">
              Autor: {viewPost.userName} · {reactionsBody(viewPost)}
            </small>
          </div>
        )}
      </Dialog>
    </div>
  );
}
