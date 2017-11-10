#!/usr/bin/env node

const program = require('commander');
const fs = require('fs-extra');
const Handlebars = require('handlebars');
const path = require('path');
const pdf = require('html-pdf');

const TEMPLATE_PATH = path.resolve('./template/magezine.hbs');
const DATA_PATH = path.resolve('./data');
const POST_PATH = path.resolve('./posts');

program
    .version('0.1.0')
    .option('-a, --all', 'Generate all magazine')
    .option('-d, --data-path [datapath]', 'The path of data.json the for generate magazine')
    .parse(process.argv);

function toHTML(templatePath, data, outPath) {
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template(data);

    fs.outputFileSync(outPath, html);
    console.log('Generate html:', outPath);
    return {
        html
    }
}


function toPDF(html, outPath) {
    pdf.create(html, {
        format: 'Tabloid',
        border: {
            top: '70px',
            bottom: '70px',
        },
    }).toFile(outPath, (err, res) => {
        if (err) return console.error('Generate pdf fail', err);
        console.log('Generate pdf:', res.filename);
    });
}


let dataPaths = [];

if (program.all) {
    const data = fs.readdirSync(DATA_PATH);
    const paths = data.map(file => fs.realpathSync(path.resolve(__dirname, DATA_PATH, file)));
    dataPaths = dataPaths.concat(paths);
}

if (program.dataPath) {
    dataPaths.push(path.resolve(__dirname, program.dataPath));
}


dataPaths.forEach((dataPath) => {
    const data = require(dataPath);
    const { name: filename } = path.parse(dataPath);

    // toHTML
    const { html } = toHTML(TEMPLATE_PATH, data, path.resolve(__dirname, POST_PATH, `${filename}/${filename}.html`));

    // toPDF
    toPDF(html, path.resolve(__dirname, POST_PATH, filename, `前端大宝剑月刊 ${filename.toUpperCase()}.pdf`));
});