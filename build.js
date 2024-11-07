const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const outputDir = path.join(__dirname, 'public');

// Asegúrate de que el directorio de salida exista
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Datos de ejemplo para roomId
const data = { roomId: 'example-room-id' };

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
