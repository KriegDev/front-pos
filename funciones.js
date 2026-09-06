//FUNCIONES LOGIN
function limpiar_errores(){
    console.log("funcion limpiar errores");
            const lista_errores = document.getElementsByClassName("mensaje-error");
            for(var elemento of lista_errores){
                elemento.innerHTML = "";
            }
        }

function irDashboard(rol){
    window.location.href="dashboard.html?rol=" +rol;
}

function ingresar(){
    console.log("Procesando...")
    limpiar_errores();
    const formulario = document.getElementById("form-login");
    const datos_formulario = new FormData(formulario);
    var usuario = datos_formulario.get("campo-usuario");
    var contraseña = datos_formulario.get("campo-contraseña");
    const rol = validarUsuario(usuario,contraseña);
    
    if(rol=="admin"){
        localStorage.setItem("rol",rol);
        window.location.href="dashboard.html";
        console.log("Usuario: "+usuario+" Rol: "+rol);
    }else if (rol == "vendedor"){
            localStorage.setItem("rol",rol);
            window.location.href="dashboard.html";   
            console.log("Usuario: "+usuario+" Rol: "+rol) ;   
    }else{
            document.getElementById("mensaje-usuario").innerHTML = "Credenciales incorrectas";
           console.log("credenciales incorrectas");}}

    const admin = {
    usuario : "admin",
    contraseña: "12345",
    rol: "admin"}

        const vendedor = {
    usuario : "vendedor",
    contraseña : "123",
    rol : "vendedor"}


function validarUsuario(usuario,contraseña){
    
    if(admin.contraseña == contraseña && admin.usuario == usuario){
        
        return admin.rol;
    }else if(vendedor.contraseña==contraseña && vendedor.usuario==usuario){
        return vendedor.rol;
    }else{
        return null;}}


//FUNCIONES DASHBOARD
        const rol = localStorage.getItem("rol");
        mostrarBotones(rol)
        
function mostrarBotones(rol){
    if(rol=="admin"){
        document.getElementById("boton_dashboard").style.display = "block";
        document.getElementById("boton_nuevaVenta").style.display = "block";
        document.getElementById("boton_mostrarProductos").style.display = "block";
        document.getElementById("boton_Clientes").style.display = "block";
        document.getElementById("boton_inventario").style.display = "block";
        document.getElementById("boton_ventas").style.display = "block";
        document.getElementById("boton_pagos").style.display = "block";
        document.getElementById("boton_facturas").style.display = "block";
        document.getElementById("boton_proveedores").style.display = "block";
        document.getElementById("boton_reportes").style.display = "block";
        document.getElementById("boton_notificaciones").style.display = "block";
        document.getElementById("boton_usuarios").style.display = "block";
        document.getElementById("boton_salir").style.display = "block";
    }else if(rol=="vendedor"){
        document.getElementById("boton_mostrarProductos").style.display = "none";
        document.getElementById("boton_Clientes").style.display = "none";
        document.getElementById("boton_inventario").style.display = "none";
        document.getElementById("boton_proveedores").style.display = "none";
        document.getElementById("boton_reportes").style.display = "none";
        document.getElementById("boton_notificaciones").style.display = "none";
        document.getElementById("boton_usuarios").style.display = "none";
    }
}
 
function mostrarProductos(){
    console.log("mostrando productos");
    document.getElementById("zona_principal").innerHTML = `
    <div id="productos">
        <h1>
            PRODUCTOS
        </h1>

        <div id="buscadores">
            <span>🔎</span><input id="buscador" type="search" placeholder="Ingrese producto...">
            <button id="btn-buscar-producto">buscar</button>
            <label for="combo-categoria"> Categoría: </label>
            <select name="categoria" id="combo-categoria">
                <option value="">Todas ▼</option>
                <option value="">Abarrotes</option>
                <option value="">Lácteos</option>
                <option value="">Verduras</option>
            </select>
        </div>
        <div id="contenedor-tabla-productos">
            <table id="tabla-productos">
                <tr class="impar">
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                </tr>
                <tr class="par">
                    <td>P001</td>
                    <td>Leche</td>
                    <td>Lácteos</td>
                    <td>$1500</td>
                    <td>20</td>
                </tr>
                <tr class="impar">
                    <td>P002</td>
                    <td>Arroz Tucapel 1kg</td>
                    <td>Abarrotes</td>
                    <td>2000</td>
                    <td>12</td>
                </tr>

            </table>
        </div>
    </div>`;
}

function mostrarClientes(){
    console.log("mostrando clientes");
    document.getElementById("zona_principal").innerHTML =`
    <div id="clientes">
        <h1>
            CLIENTES 
        </h1>

        <div id="buscadores-cliente">
            <span>🔎</span><input id="buscador-cliente" type="search" placeholder="Ingrese RUN...">
            <button id="btn-buscar-cli">buscar</button>

        </div>
        <div>
            <table id="tabla-clientes">
                <tr class="impar">
                    <th>RUN</th>
                    <th>NOMBRE</th>
                    <th>ESTADO</th>
                </tr>
                <tr class="par">
                    <td>123456789</td>
                    <td>Jhon Doe</td>
                    <td>✓ Activo</td>
                </tr>
                <tr class="impar">
                    <td>987654321</td>
                    <td>Juan Pérez</td>
                    <td>✓ Activo</td>
                </tr>

            </table>
        </div>
    </div> `;
}

function mostrarInventario(){
    console.log("mostrando inventario");
    console.log("mostrando clientes");
    document.getElementById("zona_principal").innerHTML =`
    <div id="inventario">
        <h1>
            STOCK ACTUAL 
        </h1>

        <div>
            <table id="tabla-inventario">
                <tr class="impar">
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                </tr>
                <tr class="par">
                    <td>Leche</td>
                    <td>20</td>
                    <td>15</td>
                </tr>
                <tr class="impar">
                    <td>Arroz</td>
                    <td>12</td>
                    <td>10</td>
                </tr>
            </table>

            <button id="btn-mov-inventario" onclick="movimientoInventario()"> VER MOVIMIENTOS</button>
            <button id="btn-bajo-stock" onclick="bajoStock()"> BAJO STOCK </button>
            <button id="btn-actualizar-stock" onclick="actualizarStockMinimo()"> ACTUALIZAR STOCK MÍNIMO </button>
        </div>
    </div>
    `;
}

function movimientoInventario(){
    console.log("mostrando movimientos inventario")
}

function bajoStock(){
    console.log("mostrando stock bajo")
}

function actualizarStockMinimo(){
    console.log("mostrando actualizar stock mínimo")
}

function mostrarProveedores(){
    console.log("mostrando proovedores");
}

function mostrarReportes(){
    console.log("mostrando reportes");
}

function mostrarNotificaciones(){
    console.log("mostrando notificaciones");
}

function mostrarUsuarios(){
    console.log("mostrando usuarios");
}



/*FUNCIONES PEDRO*/ 
function mostrarDashboard(){
    console.log("mostrando dashboard");
}

function mostrarNuevaVenta(){
    console.log("nueva venta");
}

function mostrarVentas(){
    console.log("mostrando ventas");
}

function mostrarPagos(){
    console.log("mostrando pagos");
}

function mostrarFacturas(){
    console.log("mostrando facturas");
}

function mostrarSalir(){
    console.log("salir");
}
