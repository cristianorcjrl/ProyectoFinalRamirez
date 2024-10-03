// Define la clase Producto
class Producto {
    constructor(nombre, precios, imagen) {
        this.nombre = nombre;
        this.precios = precios; // Objeto que contiene los precios por tamaño
        this.imagen = imagen;
    }
  }
  
  // Carrito de compras Array vacío
  let carrito = [];
  
  // Elementos del DOM
  const listaCarrito = document.getElementById('lista-carrito');
  const totalCarrito = document.getElementById('total-carrito');
  const listaProductos = document.getElementById('lista-productos');
  const titulo = document.getElementById('titulo');
  const productosTitulo = document.querySelector('#productos h2');
  const logo = document.getElementById('logo');
  
  // Evento mouseover y mouseout en el título
  titulo.addEventListener('mouseover', () => {
      titulo.style.color = '#ff9900'; 
      titulo.style.transform = 'scale(1.2)'; 
  });
  
  titulo.addEventListener('mouseout', () => {
      titulo.style.color = '#ffcc33'; 
      titulo.style.transform = 'scale(1)'; 
  });
  
  // Evento mouseover y mouseout en el subtítulo (Productos Disponibles)
  productosTitulo.addEventListener('mouseover', () => {
      productosTitulo.style.color = '#5a1a8c'; 
      productosTitulo.style.transform = 'scale(1.1)';
  });
  
  productosTitulo.addEventListener('mouseout', () => {
      productosTitulo.style.color = '#333';
      productosTitulo.style.transform = 'scale(1)';
  });
  
  // Evento mouseover y mouseout en el logo
  logo.addEventListener('mouseover', () => {
      logo.style.transform = 'rotate(360deg)';  
      logo.style.transition = 'transform 0.5s ease'; 
  });
  
  logo.addEventListener('mouseout', () => {
      logo.style.transform = 'rotate(0deg)'; 
  });
  
  // Función guardar el carrito en localStorage
  function guardarCarritoEnStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }
  
  // Función cargar el carrito desde localStorage
  function cargarCarritoDeStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
  }
  
  // Función Mostrar los productos en la página
  function mostrarProductos(productos) {
    productos.forEach((producto, indice) => {
        const productoHTML = document.createElement('li');
        productoHTML.classList.add('producto');
        productoHTML.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto">
            <h3>${producto.nombre}</h3>
            <select id="tamaño-${indice}">
                <option value="" disabled selected>Seleccionar tamaño</option>
                ${Object.keys(producto.precios).map(tamaño => `<option value="${tamaño}">${tamaño} - $${producto.precios[tamaño]}</option>`).join('')}
            </select>
            <button onclick="agregarAlCarrito(${indice})">Agregar al carrito</button>
        `;
        listaProductos.appendChild(productoHTML);
    });
  }
  
  // Añade el producto seleccionado al carrito usando fetch y promesas para obtener los productos desde el archivo productos.json
  function agregarAlCarrito(indice) {
    const tamañoSeleccionado = document.getElementById(`tamaño-${indice}`).value;
    if (tamañoSeleccionado) {
        fetch('productos.json')
            .then(response => response.json())
            .then(productos => {
                const producto = productos[indice];
                carrito.push({ 
                    nombre: producto.nombre, 
                    tamaño: tamañoSeleccionado, 
                    precio: producto.precios[tamañoSeleccionado] 
                });
                guardarCarritoEnStorage();
                actualizarCarrito();
  
                Swal.fire({
                    icon: 'success',
                    title: 'Producto agregado',
                    text: `${producto.nombre} (${tamañoSeleccionado}) fue añadido al carrito.`,
                    showConfirmButton: false,
                    timer: 1500
                });
  
                document.getElementById(`tamaño-${indice}`).selectedIndex = 0; // Restablece el selector
            });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Selecciona un tamaño antes de agregar al carrito.',
            confirmButtonText: 'OK'
        });
    }
  }
  
  // Actualiza el contenido del carrito
  function actualizarCarrito() {
    listaCarrito.innerHTML = '';
    let total = 0;
    carrito.forEach((item, index) => {
        const itemHTML = document.createElement('li');
        itemHTML.innerHTML = `
            <span>${item.nombre} - ${item.tamaño} - $${item.precio}</span>
            <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        listaCarrito.appendChild(itemHTML);
        total += item.precio;
    });
    totalCarrito.innerText = `Total: $${total.toFixed(2)}`;
  }
  
  // Elimina producto del carrito
  function eliminarDelCarrito(indice) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'El producto será eliminado del carrito.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito.splice(indice, 1);
            guardarCarritoEnStorage();
            actualizarCarrito();
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El producto ha sido eliminado del carrito.',
                timer: 1500
            });
        }
    });
  }
  
  // Efectúa la compra
  function realizarCompra() {
    if (carrito.length > 0) {
        const total = carrito.reduce((acc, item) => acc + item.precio, 0).toFixed(2);
        const fecha = new Date().toLocaleDateString();
  
        Swal.fire({
            icon: 'success',
            title: 'Compra realizada',
            html: `Has realizado una compra por un total de <b>$${total}</b> el día <b>${fecha}</b>`,
            confirmButtonText: 'Entendido'
        });
  
        carrito = []; // Vacia carrito después de la compra
        guardarCarritoEnStorage();
        actualizarCarrito();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Carrito vacío',
            text: 'Tu carrito está vacío, agrega productos antes de realizar una compra.',
            confirmButtonText: 'OK'
        });
    }
  }
  
  // Inicializa la página cargando productos con fetch y promesas desde el archivo productos.json
  function inicializar() {
    fetch('productos.json')
        .then(response => response.json())
        .then(productos => {
            mostrarProductos(productos);
        })
        .catch(error => console.error('Error al cargar los productos:', error));
    
    cargarCarritoDeStorage();
    document.getElementById('realizar-compra').addEventListener('click', realizarCompra);
  }
  
  inicializar();
  