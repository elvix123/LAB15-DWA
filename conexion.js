const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = 3000;
const { check, validationResult } = require('express-validator');

// Configurar Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Configurar Express.js para servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Middleware para procesar datos enviados en formularios
app.use(express.urlencoded({ extended: true }));

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'lab15'
});

// Conexión a la base de datos
connection.connect((error) => {
  if (error) {
    console.error('Error al conectar a MySQL: ', error);
    return;
  }
  console.log('Conexión exitosa a MySQL');
});

// Ruta principal - Mostrar todos los registros
app.get('/', (req, res) => {
  const idCurso = 5; // El ID del curso que deseas filtrar

  // Realizar consulta a la base de datos para obtener datos de la tabla 'alumnos' y 'cursos' mediante JOIN
  const query = `
    SELECT alumnos.id, alumnos.nombre, cursos.nombre_curso
    FROM alumnos
    JOIN cursos ON alumnos.id_curso = cursos.id_curso
    WHERE cursos.id_curso = ?;
  `;

  connection.query(query, [idCurso], (error, resultados) => {
    if (error) {
      console.error('Error al obtener los datos: ', error);
      return;
    }

    // Renderizar la vista y pasar los resultados de la consulta a través del objeto locals
    res.render('index', { datos: resultados });
  });
});




// Ruta para mostrar el formulario de agregar nuevo dato
app.get('/agregar', (req, res) => {
  res.render('alumnos/agregar');
});

// Manejar la solicitud POST para agregar un nuevo dato
app.post('/agregar', [
  check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  check('edad').isInt().withMessage('La edad debe ser un número entero'),
  check('apellido').notEmpty().withMessage('El apellido es obligatorio'),
  check('id_curso').isInt().withMessage('El ID del curso debe ser un número entero'),
], (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Si hay errores de validación, renderizar el formulario con los errores
    return res.render('alumnos/agregar', { errors: errors.array() });
  }

  // Continuar con la lógica de inserción si no hay errores de validación
  const { nombre, edad, apellido, id_curso } = req.body;

  // Consulta SQL de inserción
  const consulta = 'INSERT INTO alumnos (nombre, edad, apellido, id_curso) VALUES (?, ?, ?, ?)';

  // Ejecutar la consulta de inserción
  connection.query(consulta, [nombre, edad, apellido, id_curso], (error, results) => {
    if (error) {
      console.error('Error al insertar datos: ', error);
      return;
    }
    console.log('Dato insertado exitosamente');
    res.redirect('/');
  });
});

// Ruta para mostrar el formulario de editar un dato
    app.get('/editar/:id', (req, res) => {
    const id = req.params.id;

    // Consulta SQL para obtener el dato a editar
    const consulta = 'SELECT * FROM alumnos WHERE id = ?';

    // Ejecutar la consulta
    connection.query(consulta, [id], (error, resultado) => {
        if (error) {
        console.error('Error al obtener el dato: ', error);
        return;
        }

        // Renderizar la vista de edición con el dato obtenido
        res.render('alumnos/editar', { dato: resultado[0] });
    });
    });

// Manejar la solicitud POST para actualizar un dato
app.post('/editar/:id', (req, res) => {
  const id = req.params.id;
  const nuevoDato = req.body.nuevoDato;

  // Consulta SQL de actualización
  const consulta = 'UPDATE alumnos SET nombre = ? WHERE id = ?';

  // Ejecutar la consulta de actualización
  connection.query(consulta, [nuevoDato, id], (error, results) => {
    if (error) {
      console.error('Error al actualizar datos: ', error);
      return;
    }
    console.log('Dato actualizado exitosamente');
    res.redirect('/');
  });
});

// Ruta para eliminar un dato
app.get('/eliminar/:id', (req, res) => {
  const id = req.params.id;

  // Consulta SQL para eliminar un dato
  const consulta = 'DELETE FROM alumnos WHERE id = ?';

  // Ejecutar la consulta de eliminación
  connection.query(consulta, [id], (error, results) => {
    if (error) {
      console.error('Error al eliminar el dato: ', error);
      return;
    }
    console.log('Dato eliminado exitosamente');
    res.redirect('/');
  });
});






// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
