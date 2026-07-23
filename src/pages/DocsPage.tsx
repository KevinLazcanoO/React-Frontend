import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
// Estilos de las capas de texto y anotaciones del PDF (necesarios para que se vea bien).
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configuramos el "worker" de pdfjs: un hilo aparte que procesa el PDF sin bloquear la UI.
// new URL(..., import.meta.url) hace que Vite empaquete y sirva el worker correctamente.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// Ruta del PDF (está en /public, así que se sirve desde la raíz).
const FILE_URL = '/manual-ayuda.pdf';
const FILE_NAME = 'manual-ayuda.pdf';

export default function DocsPage() {
  const { t } = useTranslation();
  const [numPages, setNumPages] = useState(0); // Total de páginas (lo da el PDF al cargar).
  const [pageNumber, setPageNumber] = useState(1); // Página actual.
  const [scale, setScale] = useState(1.0); // Nivel de zoom.
  const [error, setError] = useState<string | null>(null);

  // Callback cuando el PDF carga correctamente: guardamos el número de páginas.
  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  // Navegación entre páginas, con límites para no salirnos del rango.
  const goPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goNext = () => setPageNumber((p) => Math.min(numPages, p + 1));

  // Zoom con límites (entre 50% y 300%).
  const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.2).toFixed(1)));
  const zoomOut = () => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(1)));
  const zoomReset = () => setScale(1.0);

  // Salto directo a una página escribiendo el número en el InputText.
  const onPageInput = (value: string) => {
    const n = Number(value);
    if (!Number.isNaN(n) && n >= 1 && n <= numPages) setPageNumber(n);
  };

  // Descarga del archivo: creamos un enlace temporal y lo "clicamos".
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = FILE_URL;
    link.download = FILE_NAME;
    link.click();
  };

  // Barra de controles (con botones e input de PrimeReact).
  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      {/* Controles de navegación de páginas */}
      <div className="flex align-items-center gap-2">
        <Button
          icon="pi pi-chevron-left"
          rounded
          text
          onClick={goPrev}
          disabled={pageNumber <= 1}
          aria-label={t('docs.prev')}
        />
        <span className="flex align-items-center gap-1">
          <InputText
            value={String(pageNumber)}
            onChange={(e) => onPageInput(e.target.value)}
            className="w-3rem text-center p-1"
            aria-label={t('docs.pageInput')}
          />
          <span className="text-color-secondary">/ {numPages || '-'}</span>
        </span>
        <Button
          icon="pi pi-chevron-right"
          rounded
          text
          onClick={goNext}
          disabled={pageNumber >= numPages}
          aria-label={t('docs.next')}
        />
      </div>

      {/* Controles de zoom */}
      <div className="flex align-items-center gap-2">
        <Button
          icon="pi pi-search-minus"
          rounded
          text
          onClick={zoomOut}
          disabled={scale <= 0.5}
          aria-label={t('docs.zoomOut')}
        />
        <Button
          label={`${Math.round(scale * 100)}%`}
          text
          onClick={zoomReset}
          aria-label={t('docs.zoomReset')}
        />
        <Button
          icon="pi pi-search-plus"
          rounded
          text
          onClick={zoomIn}
          disabled={scale >= 3}
          aria-label={t('docs.zoomIn')}
        />
      </div>

      {/* Descarga */}
      <Button label={t('docs.download')} icon="pi pi-download" onClick={handleDownload} />
    </div>
  );

  return (
    <Card title={t('docs.title')} header={<div className="p-3 pb-0">{header}</div>}>
      {error && <Message severity="error" text={error} className="mb-3 w-full" />}

      {/* Contenedor con scroll por si el PDF es más grande que la ventana */}
      <div
        className="flex justify-content-center surface-100 p-3 border-round"
        style={{ overflow: 'auto', maxHeight: '70vh' }}
      >
        <Document
          file={FILE_URL}
          onLoadSuccess={onLoadSuccess}
          onLoadError={() => setError(t('docs.loadError'))}
          loading={<ProgressSpinner />} // Spinner mientras se descarga/parses el documento.
        >
          {/* Renderizamos SOLO la página actual, aplicando el zoom (scale) */}
          <Page pageNumber={pageNumber} scale={scale} />
        </Document>
      </div>
    </Card>
  );
}
