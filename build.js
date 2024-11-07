const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const outputDir = path.join(__dirname, 'public');

// Asegúrate de que el directorio de salida exista
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Obtener roomId y port de los argumentos de la línea de comandos
const roomId = process.argv[2];
const port = process.argv[3];
console.log("build", roomId, port);

// Datos para roomId y port
const data = {
    roomId: roomId,
    port: port
};

// Lee y renderiza cada archivo .ejs
fs.readdirSync(viewsDir).forEach(file => {
    if (path.extname(file) === '.ejs') {
        const filePath = path.join(viewsDir, file);
        const outputFilePath = path.join(outputDir, path.basename(file, '.ejs') + '.html');
        const template = fs.readFileSync(filePath, 'utf-8');
        const html = ejs.render(template, data);
        fs.writeFileSync(outputFilePath, html);
    }
});
