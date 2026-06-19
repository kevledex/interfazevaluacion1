const API_URL = "http://localhost:8080/api/vehiculos";

// FUNCIÓN AUXILIAR: Transforma un array de vehículos en tarjetas visuales elegantes
function renderizarTarjetas(vehiculos) {
    const contenedor = document.getElementById("contenedor-vehiculos");
    contenedor.innerHTML = ""; // Limpiar contenido previo

    if (!vehiculos || vehiculos.length === 0 || (vehiculos.error)) {
        contenedor.innerHTML = `<p class="text-sm text-slate-400 col-span-full text-center py-8">No se encontraron registros de vehículos.</p>`;
        return;
    }

    // Si nos pasan un solo objeto en vez de una lista, lo volvemos un array
    const lista = Array.isArray(vehiculos) ? vehiculos : [vehiculos];

    lista.forEach(v => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition flex flex-col justify-between";
        
        // Estilo basado en si hay unidades disponibles o no
        const stockBadge = v.unidadesDisponibles > 0 
            ? `<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">${v.unidadesDisponibles} disp.</span>`
            : `<span class="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Agotado</span>`;

        tarjeta.innerHTML = `
            <div>
                <div class="flex items-start justify-between gap-2 mb-2">
                    <span class="text-[11px] font-mono text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded">ID: ${v.id}</span>
                    <span class="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium px-2.5 py-0.5 rounded-lg">${v.categoria}</span>
                </div>
                <h3 class="text-base font-bold text-slate-900 mb-1">${v.modelo}</h3>
                <p class="text-xs text-slate-500 leading-relaxed mb-4">${v.descripcion || 'Sin descripción disponible.'}</p>
            </div>
            <div class="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                    <span class="text-[10px] text-slate-400 block uppercase font-medium">Por Día</span>
                    <span class="text-base font-extrabold text-slate-900">$${v.precioPorDia.toFixed(2)}</span>
                </div>
                ${stockBadge}
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// 1. OBTENER TODO (GET)
async function cargarVehiculos() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        renderizarTarjetas(data);
    } catch (error) {
        alert("Error al cargar la lista desde la API.");
    }
}

// 2. BUSCAR POR ID (GET /{id})
async function buscarPorId() {
    const id = document.getElementById("buscar-id").value;
    if(!id) return alert("Ingresa un ID");

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();
        renderizarTarjetas(data);
    } catch (error) {
        renderizarTarjetas([]);
    }
}

// 3. BUSCAR POR MODELO (GET /modelo/{modelo})
async function buscarPorModelo() {
    const modelo = document.getElementById("buscar-modelo").value;
    if(!modelo) return alert("Ingresa un término de búsqueda para el modelo");

    try {
        const response = await fetch(`${API_URL}/modelo/${modelo}`);
        const data = await response.json();
        renderizarTarjetas(data);
    } catch (error) {
        renderizarTarjetas([]);
    }
}

// 4. CREAR (POST)
async function crearVehiculo() {
    const msg = document.getElementById("msg-crear");
    const vehiculo = {
        modelo: document.getElementById("modelo").value,
        descripcion: document.getElementById("descripcion").value,
        categoria: document.getElementById("categoria").value,
        precioPorDia: parseFloat(document.getElementById("precioPorDia").value) || 0,
        unidadesDisponibles: parseInt(document.getElementById("unidadesDisponibles").value) || 0
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vehiculo)
        });
        const data = await response.json();

        if (response.status === 201) {
            msg.className = "text-xs font-medium text-emerald-600";
            msg.innerHTML = `✓ Vehículo creado correctamente (ID: ${data.id})`;
            cargarVehiculos();
        } else {
            msg.className = "text-xs font-medium text-red-600";
            msg.innerHTML = "Errores: " + Object.values(data).join(", ");
        }
    } catch (e) {
        msg.className = "text-xs font-medium text-red-600";
        msg.textContent = "Error de red.";
    }
}

// 5. ACTUALIZAR (PUT /{id})
async function actualizarVehiculo() {
    const id = document.getElementById("upd-id").value;
    const msg = document.getElementById("msg-actualizar");
    if(!id) return alert("Por favor ingresa el ID del registro que vas a modificar");

    const vehiculo = {
        modelo: document.getElementById("upd-modelo").value,
        descripcion: document.getElementById("upd-descripcion").value,
        categoria: document.getElementById("upd-categoria").value,
        precioPorDia: parseFloat(document.getElementById("upd-precioPorDia").value) || 0,
        unidadesDisponibles: parseInt(document.getElementById("upd-unidadesDisponibles").value) || 0
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vehiculo)
        });
        const data = await response.json();

        if (response.status === 200) {
            msg.className = "text-xs font-medium text-amber-600";
            msg.innerHTML = "✓ Registro modificado con éxito.";
            cargarVehiculos();
        } else {
            msg.className = "text-xs font-medium text-red-600";
            msg.innerHTML = data.error || ("Errores: " + Object.values(data).join(", "));
        }
    } catch (e) {
        msg.className = "text-xs font-medium text-red-600";
        msg.textContent = "Error en la actualización.";
    }
}

// 6. ELIMINAR (DELETE /{id})
async function eliminarVehiculo() {
    const id = document.getElementById("eliminar-id").value;
    const msg = document.getElementById("msg-eliminar");
    if(!id) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const data = await response.json();

        if (response.ok) {
            msg.className = "text-xs font-medium text-emerald-600 mt-2";
            msg.textContent = data.mensaje;
            cargarVehiculos();
        } else {
            msg.className = "text-xs font-medium text-red-600 mt-2";
            msg.textContent = data.error;
        }
    } catch (e) {
        msg.textContent = "Error de conexión.";
    }
}