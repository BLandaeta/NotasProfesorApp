document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // Definiciones y Selectores (Traducidos)
    // ----------------------------------------------------------------------
    const contenedorClases = document.querySelector('.linea-tiempo-clases');
    const contenedorMaterias = document.getElementById('contenedor-navegador-materias');
    const plantillaTarjeta = document.getElementById('plantilla-tarjeta-clase').innerHTML;
    let claseActiva = null;

    // Estructura de Datos de las Materias
    const listaMaterias = [
        { id: 'matematicas', nombre: 'Matemáticas', etiqueta: 'Cálculo' },
        { id: 'ingles', nombre: 'Inglés', etiqueta: 'Avz. 2' },
        { id: 'basededatos', nombre: 'Base de Datos', etiqueta: 'Modelado' },
        { id: 'programacion', nombre: 'Programación', etiqueta: 'Python' },
        { id: 'historia', nombre: 'Historia', etiqueta: 'Moderna' },
    ];
    
    // Función de utilidad para obtener detalles adicionales de una clase
    function obtenerDetallesClase(claseId) {
        // En un caso real, esto vendría de una base de datos.
        // Aquí simulamos los datos basados en el ID de la clase.
        const detalles = {
            'introduccion': { fecha: '14/11/2025', seccion: 'A-201', aula: 'Laboratorio 3' },
            'redaccion': { fecha: '15/11/2025', seccion: 'B-105', aula: 'Sala de Lectura' },
            'modelado': { fecha: '15/11/2025', seccion: 'C-302', aula: 'Aula Magna' },
            'diferenciales': { fecha: '16/11/2025', seccion: 'A-201', aula: 'Laboratorio 3' },
            'gramatica': { fecha: '16/11/2025', seccion: 'B-105', aula: 'Sala de Lectura' },
        };
        return detalles[claseId] || { fecha: 'N/A', seccion: 'N/A', aula: 'N/A' };
    }

    // ----------------------------------------------------------------------
    // 1. Lógica de la Tarjeta Negra (Clase)
    // ----------------------------------------------------------------------

    function desactivarTarjetaClase(item) {
        item.classList.remove('clase-activa');
        const tarjetaAntigua = item.querySelector('.tarjeta-clase');
        if (tarjetaAntigua) {
             const punto = '<div class="punto-tiempo"></div>';
             const titulo = tarjetaAntigua.querySelector('.titulo-clase').textContent;
             const descripcion = tarjetaAntigua.querySelector('.descripcion-clase').textContent;
             const hora = tarjetaAntigua.querySelector('.hora-clase').textContent;
             
             // NOTA: Para simplificar, revertimos al HTML base de info-clase, perdiendo la descripción adicional.
             item.innerHTML = `${punto}<div class="info-clase"><h2 class="titulo-clase">${titulo}</h2><p class="descripcion-clase">${descripcion}</p></div><span class="hora-clase">${hora}</span>`;
        }
    }

    function activarTarjetaClase(item) {
        const claseId = item.getAttribute('data-clase');
        const detalles = obtenerDetallesClase(claseId);
        
        if (claseActiva === item) {
            desactivarTarjetaClase(item);
            claseActiva = null;
            return;
        }

        if (claseActiva) {
            desactivarTarjetaClase(claseActiva);
        }

        item.classList.add('clase-activa');
        claseActiva = item;

        const titulo = item.querySelector('.info-clase .titulo-clase').textContent;
        const descripcion = item.querySelector('.info-clase .descripcion-clase').textContent;
        const hora = item.querySelector('.hora-clase').textContent;

        let nuevoHTMLTarjeta = plantillaTarjeta
            .replace('Título de Clase', titulo)
            .replace('Descripción de la clase', descripcion)
            .replace('00:00 AM', hora);
            
        // Inyectar los detalles adicionales en la plantilla
        nuevoHTMLTarjeta = nuevoHTMLTarjeta.replace('<span class="detalle-fecha">14/11/2025</span>', `<span class="detalle-fecha">${detalles.fecha}</span>`);
        nuevoHTMLTarjeta = nuevoHTMLTarjeta.replace('<span class="detalle-seccion">A-201</span>', `<span class="detalle-seccion">${detalles.seccion}</span>`);
        nuevoHTMLTarjeta = nuevoHTMLTarjeta.replace('<span class="detalle-aula">Laboratorio 3</span>', `<span class="detalle-aula">${detalles.aula}</span>`);

        item.innerHTML = `<div class="punto-tiempo"></div><div class="contenido-info-clase">${nuevoHTMLTarjeta}</div>`;
    }
    
    document.querySelectorAll('.clase-seleccionable').forEach(item => {
        item.addEventListener('click', function() {
            activarTarjetaClase(this);
        });
    });


    // ----------------------------------------------------------------------
    // 2. Lógica de Filtrado por Materia
    // ----------------------------------------------------------------------

    function filtrarClasesPorMateria(materiaIdSeleccionada) {
        contenedorClases.scrollTop = 0; 
        
        if (claseActiva) {
            desactivarTarjetaClase(claseActiva);
            claseActiva = null; 
        }

        document.querySelectorAll('.clase-seleccionable').forEach(item => {
            item.style.display = 'none';

            if (item.getAttribute('data-materia') === materiaIdSeleccionada) {
                item.style.display = 'flex'; 
            }
        });

        document.querySelector('.espaciador-tiempo').style.display = 'block'; 
    }
    
    // ----------------------------------------------------------------------
    // 3. GENERACIÓN DINÁMICA DE MATERIAS
    // ----------------------------------------------------------------------

    function crearElementoMateria(materia, esActivaInicial = false) {
        const claseActiva = esActivaInicial ? 'activo' : '';

        const elementoMateriaHTML = document.createElement('div');
        elementoMateriaHTML.className = `elemento-materia ${claseActiva}`;
        elementoMateriaHTML.setAttribute('data-materia-id', materia.id);
        elementoMateriaHTML.innerHTML = `
            <span class="nombre-materia">${materia.nombre}</span>
            <span class="etiqueta-materia">${materia.etiqueta}</span>
        `;
        
        elementoMateriaHTML.addEventListener('click', function() {
            // Desactiva la materia anterior y activa la actual
            contenedorMaterias.querySelectorAll('.elemento-materia').forEach(d => d.classList.remove('activo'));
            this.classList.add('activo');

            filtrarClasesPorMateria(materia.id);
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        
        return elementoMateriaHTML;
    }

    function generarNavegadorMaterias() {
        contenedorMaterias.innerHTML = ''; 
        
        // La primera materia será la activa por defecto
        const materiaInicial = listaMaterias[0];

        listaMaterias.forEach((materia, index) => {
            const esActivaInicial = index === 0;
            const elementoMateria = crearElementoMateria(materia, esActivaInicial);
            contenedorMaterias.appendChild(elementoMateria);
        });
        
        // 4. Actualizar el encabezado y activar la materia inicial
        document.getElementById('nombre-profesor').textContent = 'Agenda de Clases';

        // 5. Filtrar las clases para mostrar solo las de la materia inicial
        if (materiaInicial) {
             filtrarClasesPorMateria(materiaInicial.id);
             
             // Asegurarse de que la primera materia esté visible
             const primerElemento = contenedorMaterias.querySelector('.elemento-materia');
             if (primerElemento) {
                 primerElemento.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
             }
        }
    }


    // ----------------------------------------------------------------------
    // 4. INICIALIZACIÓN
    // ----------------------------------------------------------------------
    
    generarNavegadorMaterias(); 
});