const express = require("express");
const path = require("path");
const multer = require("multer");
const app = express();
const fs = require('fs');
/*const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));*/

app.set("view engine", "ejs");

/////////////////////////////////////////////////////////GUARDAR LOS DATOS
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/upload", upload.array("files"), (req, res) => {
    res.sendFile(path.join(__dirname, "upload-success.html"));
});
//////////////////////////////////////////////////////////////////LISTAR LOS ARCHIVOS EN LA TABLA
app.get('/file-list', (req, res) => {
    const uploadDirectory = path.join(__dirname, 'uploads');
    fs.readdir(uploadDirectory, (err, files) => {
        if (err) {
            return res.status(500).send('Error al obtener la lista de archivos');
        }
        res.json(files);
    });
});

///////////////////////////////////////////////////////////////////////MOSTRAR ARCHIVO EN OTRO ARCHIVO
// Ruta para obtener el contenido de un archivo específico
app.get('/view-file', (req, res) => {
  const fileName = req.query.fileName; // Obtener el nombre del archivo desde la solicitud
  const filePath = path.join(__dirname, 'uploads', fileName);

  // Verificar si el archivo existe
  if (!fs.existsSync(filePath)) {
      return res.status(404).send('El archivo no existe');
  }

  // Determinar el tipo de contenido en función de la extensión del archivo
  let contentType = 'text/plain'; // Por defecto, asumimos que es un archivo de texto

  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      contentType = 'image/jpeg'; // Si es una imagen JPEG
  } else if (fileName.endsWith('.png')) {
      contentType = 'image/png'; // Si es una imagen PNG
  } // Puedes agregar más tipos según tus necesidades

  // Establecer el tipo de contenido en la respuesta
  res.setHeader('Content-Type', contentType);

  // Leer el contenido del archivo
  fs.readFile(filePath, (err, data) => {
      if (err) {
          return res.status(500).send('Error al leer el archivo');
      }
      res.send(data); // Enviar el contenido del archivo como respuesta
  });
});

/////////////////////////////////////////////////////////////////////////////////////ELIMINA ARCHIVO
// Agrega una nueva ruta para eliminar archivos
app.delete('/delete-file', (req, res) => {
    const fileName = req.query.fileName; // Obtener el nombre del archivo desde la solicitud
    const filePath = path.join(__dirname, 'uploads', fileName);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('El archivo no existe');
    }

    // Elimina el archivo del sistema de archivos del servidor
    fs.unlink(filePath, err => {
        if (err) {
            return res.status(500).send('Error al eliminar el archivo');
        }
        res.status(200).send('Archivo eliminado exitosamente');
    });
});

// Agrega una nueva ruta para mostrar la página de edición de archivos
app.get('/edit-file', (req, res) => {
    const fileName = req.query.fileName; // Obtener el nombre del archivo desde la solicitud
    console.log("texto",fileName);
    const filePath = path.join(__dirname, 'uploads', fileName);

    // Leer el contenido del archivo y renderizar la página de edición
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        res.render('edit-file', { fileName, fileContent: data });

    });
});

/*app.get('/edit-file', (req, res) => {
    const fileName = req.query.fileName; // Obtener el nombre del archivo desde la solicitud
    const filePath = path.join(__dirname, 'uploads', fileName);

    // Leer el contenido del archivo de texto
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        // Renderizar la página de edición con el contenido del archivo
        res.sendFile(path.join(__dirname, 'edit-file.html'), {
            query: { fileName, fileContent: data },
        });
    });
});*/

// Ruta para guardar cambios en un archivo de texto
app.post('/save-file', upload.single('content'), (req, res) => {
    const fileName = req.query.fileName; // Obtener el nombre del archivo desde la solicitud
    console.log("texto",fileName);
    //const fileName = req.body.fileName; // Obtener el nombre del archivo desde el cuerpo de la solicitud
    const filePath = path.join(__dirname, 'uploads', fileName);
    //const content = req.body.content;
    const { content } = req.body;

    // Escribir el nuevo contenido en el archivo
    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error al guardar los cambios');
        }
        res.send('Cambios guardados exitosamente.');
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server Listening on port", PORT);
});