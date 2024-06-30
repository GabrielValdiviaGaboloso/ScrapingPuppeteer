import puppeteer from 'puppeteer';
import fs from 'fs/promises';

let browser;
let page;

async function openWebPage() {
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 400 
    }); 
    page = await browser.newPage();
    
    await page.goto('https://www.licitalab.cl/', { timeout: 60000 }); // Incrementa el tiempo de espera a 60 segundos
    await page.screenshot({ path: 'PantallaPrincipal.png', fullPage: true }); // Captura toda la página
    console.log(await page.title());

    // Espera a que el selector esté presente en la página
    await page.waitForSelector('.elementor-heading-title.elementor-size-default', { timeout: 60000 });

    const data = await page.evaluate(() => {
      const servicioElement = document.querySelector('.elementor-heading-title.elementor-size-default');
      const servicio = servicioElement ? servicioElement.innerText : 'Elemento no encontrado';

      const paragraphs = Array.from(document.querySelectorAll('.elementor-widget-wrap.elementor-element-populated p'));
      const paragraphTexts = paragraphs.map(p => p.innerText.replace(/\n/g, ' ')); // Reemplazar '\n' por espacio

      console.log(paragraphTexts);

      return {
        servicio,
        paragraphs: paragraphTexts,
      };
    });

    console.log(data);

    // Guardar los datos en un archivo JSON
    await fs.writeFile('Licit.json', JSON.stringify(data));

    // Llamar a la función para navegar a la siguiente página
    await nextpage();
  } catch (error) {
    console.error('Error al navegar o interactuar con la página:', error);
    await browser.close();
  }
}

async function nextpage() {
  try {
    // Navegar a la página de planes
    await page.goto('https://www.licitalab.cl/planes', { timeout: 60000 }); // Cambiado a la URL directa de los planes
    
    // Espera a que el enlace sea clickable y haz clic en él usando page.evaluate
    await page.waitForSelector('a[href="https://www.licitalab.cl/planes"]');
    await page.evaluate(() => {
      document.querySelector('a[href="https://www.licitalab.cl/planes"]').click();
    });

    // Espera un tiempo suficiente antes de continuar (ajusta según sea necesario)
    await delay(3000); // Función personalizada para esperar 3000 milisegundos

    // Aquí puedes interactuar con elementos dentro del menú desplegable si es necesario
    // Por ejemplo, podrías hacer clic en algún elemento específico del menú

    // Espera a que el selector esté presente en la página de planes
    await page.waitForSelector('.elementor-heading-title.elementor-size-default', { timeout: 60000 });

    const dataPlanes = await page.evaluate(() => {
      const servicioElement = document.querySelector('.elementor-heading-title.elementor-size-default');
      const servicio = servicioElement ? servicioElement.innerText : 'Elemento no encontrado';

      const paragraphs = Array.from(document.querySelectorAll('.elementor-widget-wrap.elementor-element-populated p'));
      const paragraphTexts = paragraphs.map(p => p.innerText.replace(/\n/g, ' ')); // Reemplazar '\n' por espacio

      console.log(paragraphTexts);

      return {
        servicio,
        paragraphs: paragraphTexts,
      };
    });

    console.log(dataPlanes);
    const servicioPrincipal = dataPlanes.servicio;
const beneficiosClave = dataPlanes.paragraphs.filter(paragraph => {
  return (
    paragraph.includes("UF") ||
    paragraph.includes("mensual + IVA") ||
    paragraph.includes("anual + IVA") ||
    paragraph.includes("Prueba gratis por 14 días") ||
    paragraph.includes("MÁS POPULAR") ||
    paragraph.includes("Colabora y optimiza los procesos") ||
    paragraph.includes("Toda la gestión de Compras Públicas") ||
    paragraph.includes("Tablas de búsquedas personalizadas")
  );
});

// Crear objeto con los elementos filtrados
const datosFiltrados = {
  servicio: servicioPrincipal.replace(/\n/g, ' '), // Reemplazar '\n' por espacio en el servicio principal
  paragraphs: beneficiosClave.map(paragraph => paragraph.replace(/\n/g, ' ')) // Reemplazar '\n' por espacio en cada párrafo
};
await page.screenshot({ path: 'PantallaPlanes.png', fullPage: true });
// Convertir a JSON
//const jsonData = JSON.stringify(datosFiltrados, null, 2);
await fs.writeFile('LicitPlanes.json', JSON.stringify(datosFiltrados));
console.log(datosFiltrados);

    await browser.close();
  } catch (error) {
    console.error('Error al navegar o interactuar con la página:', error);
    await browser.close();
  }
}

// Función personalizada para esperar un tiempo específico usando setTimeout
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Llamar a la función principal para comenzar el proceso
openWebPage();
