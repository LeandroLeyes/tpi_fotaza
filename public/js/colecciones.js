const modalGuardar = document.getElementById("modalGuardarColeccion");

if (modalGuardar) {
  const idPublicacion = modalGuardar.dataset.idPublicacion;

  modalGuardar.addEventListener("show.bs.modal", async () => {
    const lista = document.getElementById("coleccionesLista");

    try {
      const res = await fetch("/usuario/colecciones/api");

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const colecciones = await res.json();

      if (colecciones.length === 0) {
        lista.innerHTML =
          '<p class="text-muted text-center small">No tenés colecciones. Creá una abajo.</p>';
      } else {
        lista.innerHTML = colecciones
          .map(
            (c) => `
                            <form action="/usuario/publicaciones/${idPublicacion}/guardar" method="POST" class="d-grid">
                                <input type="hidden" name="idColeccion" value="${c.id}">
                                <button type="submit" class="btn btn-outline-secondary btn-sm text-start">
                                    <i class="bi bi-collection me-2"></i>${c.nombre}
                                </button>
                            </form>
                        `,
          )
          .join("");
      }
    } catch (error) {
      console.error("Error al cargar colecciones:", error);

      lista.innerHTML =
        '<p class="text-danger small">Error al cargar colecciones.</p>';
    }
  });
}
