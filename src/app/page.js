"use client";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import React, { useState, useRef, useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.css";
import MDEditor from "@uiw/react-md-editor";

import { Editor } from "@tinymce/tinymce-react";

const initialConfig = {
  menubar: false,
  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "fullscreen",
    "autoresize",
    "insertdatetime",
    "media",
    "table",
    "preview",
    "help",
    "wordcount",
    "image",
    "code",
  ],
  toolbar:
    "undo redo | blocks | " +
    "bold italic forecolor | alignleft aligncenter " +
    "alignright alignjustify | bullist numlist outdent indent | " +
    "removeformat | help media image | code",
  content_style:
    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px } .variable {display: inline;color: orange;font-weight: 600;}",
};

const textoInicial ='<p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">Las tres esferas peque&ntilde;as que se muestran en la figura 3 tienen cargas&nbsp;<strong>q1&nbsp;</strong>= $$[v/Carga 1]nC$$</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">&nbsp;, <strong>q2&nbsp;</strong>= $$[v/Carga 2]nC$$</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">&nbsp;y&nbsp;<strong>q3</strong> = $$[v/Carga 3]nC$$</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">. El flujo el&eacute;ctrico en $$N*m^2/C$$ a trav&eacute;s de la superficie S3 es: <strong>(0.25)</strong></span></p><p><img src="https://i.ibb.co/vHTqk01/Captura-de-pantalla-2023-08-13-013810.png" alt="" width="152" height="135"></p><p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">$$\\frac{([v/Carga 1]nC \\times \\frac{1C}{10^{9}nC})+([v/Carga 2]nC \\times \\frac{1C}{10^{9}nC})}{8,85 \\times 10^{-12} C^2 N \\times m^2}= [v/Flujo electrico S3]N*m^2/C$$</span></p>'

export default function Home() {
  const [textoPeticion, setTextoPeticion] = useState(textoInicial);

  async function processVariables () {
    let updatedVariables = variables
    updatedVariables.map(async (variable) => {
      let updatedVariable = variable
      if (variable.tipo === "independiente") {
        updatedVariable.valor = (Math.random() * (variable.valorMaximo - variable.valorMinimo) + variable.valorMinimo).toFixed(variable.numeroDecimales)
      } else {
        let formula = updatedVariable.formula;

      const matches = formula.match(/\[v\/(.*?)\]/g);
      if (matches) {
        for (const match of matches) {
          const identificador = match.substring(3, match.length - 1);
          const foundVariable = variables.find(v => v.identificador === identificador);
          if (foundVariable) {
            formula = formula.replace(match, foundVariable.valor.toString());
          }
        }
      }

      const result = await fetch(`https://es.symbolab.com/pub_api/bridge/solution?query=${encodeURIComponent(formula)}`, {
        method: "POST",
      });
      const data = await result.json();
      const solution = data.solution;
      const value = solution.solution.decimal;
      updatedVariable.valor = parseFloat(value).toFixed(variable.numeroDecimales)
      }
      return updatedVariable
    })
    setVariables(updatedVariables)
  }
  useEffect(() => {
    // Llamada a la función
  processVariables()
    let text = textoPeticion;
  const regex = /\[v\/(.*?)\]/g;
  const matches = text.match(regex);

  if (matches) {
    matches.forEach(match => {
      const identifier = match.slice(3, -1); // Extraer el identificador sin [v/ y ]
      const variable = variables.find(varObj => varObj.identificador === identifier);

      if (variable) {
        const imgUrl = `data:image/png;base64,${variable.base64Data}`;
        const imgTag = `<img src="${imgUrl}" style="display: inline;" alt="${identifier}" />`;
        text = text.replace(match, imgTag);
      }
    });
  }
  setTextoPeticion(text);
  }, [textoPeticion]);
  const [variables, setVariables] = useState([
    {
      base64Data:
      "iVBORw0KGgoAAAANSUhEUgAAADUAAAATCAYAAAAwE0VbAAAAAXNSR0IArs4c6QAAAgFJREFUWEftls8rRGEUhp+rkUKUlZINO1vNgq1/QGNrysqPxUxSZMVWlDQWYiFlKfInyILFZGVtJcXSUk0+HX1nOvebX8bcxGQ2M91755zznPOe97sRbfiJ2pCJf6i/MtXYpOahvwtOIphWAAdr+7DzG4G0XuB0Hy60xjLUMky8w6mDQ4VYgeESnAN3BVj6TWB2AA5mKqAM8U04FYF1UIggvwe3jaaZhwPgBZiVJnRAVr6lYcAoUHRwLb/fYO4IXrWh/r48/iD/k3zVGpmD1Qi2HVxGMORgqwIqLLzWRAzQs07OJ1jQIjzUeApmduFRp+3gTBpmFHEvUN0w5hUiMr8wDUahw3rykE3BlVwXJVWFykEmgnUtpBmZhQ3xUBjoDJC1BcozDgZrFS2NAiZr3df6TMMqJ/UdKF/8ok9QlksVKJHKiN3JakWb/U1LTJFWS1BflZ8kUxhNKvKxO9csVC/0eTNKq9MmMql6RmFH3AnFEhx3wIYucavy64KpUJ6JQMkE6lm6gyeRgnZVF9NIZiAwivJONTIKgbL77FdBlr81+YWLB3zq2ms7dvhqUt0lkYwUpe4Wys82zFp6BD26Z3Y/vU3LQbpZz9Ylbl2jaMbtknjWHwMx80gibsUbRZJBbazQWWt1N8n8P/KWHti/2HXstSZJIIn1I1BJF90oXltCfQAnUC8jZz2nFAAAAABJRU5ErkJggg==",
      identificador: "Carga 1",
      tipo: "independiente",
      valorMinimo: 1,
      valorMaximo: 10,
      valor: 1,
      exponenteBase10: 0,
      numeroDecimales: 1,
    },
    {
      base64Data:
      "iVBORw0KGgoAAAANSUhEUgAAADUAAAATCAYAAAAwE0VbAAAAAXNSR0IArs4c6QAAAg1JREFUWEftlr0vREEUxX9PiAQhUWk0dFpR0PoHxLYkKh8FEQlR0QqJyCp8FCJRyoq/QUGxUalVIqFUSjZG7pq7mTeZt+89wbKxjY25M3POveec2Ygm/ERNyIl/Un9lqrFJzUJPO5xGMKEEDKztw85vIrQC/RUoASMW12ERFhRjjdQyjL7BmYEjJeFsvnU3NZKgYjJwLjh1EMC14q6SCi0ocCFroBjB0h7cpE1zCQ6AZ2BKzmiBafkrDQMGgbKBK/n+CjPH8KINtetSfi/75D6/gYswGcF6KxR24UHW5X/AtJ5XJeUDT5qEQ+hJJ7cIqxHMKQhLalgv9TvrKOJOQHTAkFWIyPzCaTAKMk0ZggEYi5EKsU87KGmSlhQO6VgXZZ/UGOhLAu2DrIfFadqWNEVqq5P6DCkLft5eWJNLgJRMcsD1ZAi0b34Dl2mTSvJ8Lvlpl4F5vVTk43ouL6ku6NYk06TNMql6IZYaFO5426BcgZMW2FAT+37MK792GHdNbpUT84gvv1BSuzWZIt3Ao0hBu2qgql+nW71eUNQ8lRYUQspNM2uFUpL8/PNCfos9voFHDf/x1UvVS7IuoPTd8Cel6epHegSd6jPXn0Im+jD8ZijWbdpuB8iUNXEb8tvPAouFR9a0zVL37aT8ZA1FcBageWq+nZSbmArMQEHflDxgs9b+CKmsYL6qrilJvQPZ7DAjs9nYYgAAAABJRU5ErkJggg==",
      identificador: "Carga 2",
      tipo: "independiente",
      valorMinimo: -10,
      valorMaximo: -1,
      valor: -1,
      exponenteBase10: 0,
      numeroDecimales: 1,
    },
    {
      base64Data:
      "iVBORw0KGgoAAAANSUhEUgAAADUAAAATCAYAAAAwE0VbAAAAAXNSR0IArs4c6QAAAhFJREFUWEftlj9LXFEQxX9PIgtGIqRKY6OdbbAwrV9AtHUhlZpCESFiFVtBEHELTYogWMoufgYLLcTK2ioIWloKkiuz3llmx/v2j+6CLm6zC+/uzDlnzpz7Mnrwk/UgJ95JvZWp1k1qDoYKsJ/BlBIIsFqCzddEyOP0GGuklmHiPxwE+K0kVmD4HsrA+Q78eA3EDKFrwaQYA2yUoCIYq6T0IHDipyJkA+xksLQNp82muQS7wA0wK7X7oCjfIhgwCpwFOJbfd/D9D9yqoPG5HL+U/0k/L6THI89jT1T4KqnUwdRUvEpyZhF+ZjCvIGKDrx9gZgv+GSUPRTDjiAshNQBj0SFi84oRGCXdyCG5k1qE6QzWFEg7NvOCeNWkNlC0AOVMgC95oEUo4FsjUs4xe3Y9qpN6DqkIfiEKULNLgpRMcsQ2TYE2+zsuNQMctTIpdYsVoS37Gf8uaFOxj925dkkNwqcYRuOaYq1MyrrJu6VpUFjP9sPZPfztg1+6xC+1XwEmvT0bkUq5KklKwyIv0gNciRVUVY1PY5nPLihqSdQsKISU3ecIupxnP5/UqfCqu3y9r6O36y5fbaq7JJYRUAGq6ebtZwWzkZ7BR90zu59CJnu8b9bzYj2B82lQtJN2nTgbr4G68OhEXa3R9RdavwOpe6WThGpvFJ0u6uu5+Je4ntFXmm707vqkugG6Wc2eJPUApjkxI6uT6q0AAAAASUVORK5CYII=",
      identificador: "Carga 3",
      tipo: "independiente",
      valorMinimo: 1,
      valorMaximo: 10,
      valor: 1,
      exponenteBase10: 0,
      numeroDecimales: 1,
    },
    {
      base64Data:
      "iVBORw0KGgoAAAANSUhEUgAAAHMAAAATCAYAAACjtzK8AAAAAXNSR0IArs4c6QAAAw9JREFUaEPtmD9rFGEQxn8bLsRCtLaw0Y8gFoqtvSQINoJYBBUSgmIIFhYWEiKIJKAhhQhpBFH8Amm1CLZ2SWNjJdiIR2JWZrPvMjv3vru3d7uXcNnr9vbdnT/PzDzPbET7G5sMRGMTSRsILZhjVAQtmOMK5hw8jmDFF18MM5OwvQ8fY1heg09leZiHN3JmFe6Xna16X3wFrnbhzgb8rvq8Oz8LZ6fgHbAZimkBrsSwGsH8K/g6qK3Qc2me7rn7MXy2cT2E85J74LKcEzysv7nOTMG8EEq+e2G/YNYdtH7fKMFsMg5fwaf/XerAzEv4ofL+YQ1ehIprKDCtI9aIvT8H09FhdclvZwJuF1W6OZ+rRgumrVxgXRel+HYAm8DFtLIXu7AhXRnBDfffJLzfS4YJOxE8ki45gNcdeO46s8iW63T3TuuHLoxQc9j/0zwsOXDVNPki4Lp3jgzM1KEVB6C9ttVvA7CFosE8DWf0+LfB2uTo6y5s6TGrgPrmikHb/gPf0/NJIrUtVRw/5VkFbHJtY1TPUoUuqnRmD2fGsCiO26T025l/YUknwAUV4tQQj2ka0GBOwWwEOXpIO/FZB+7uwa0Qv1pbvm7RyfsH5yLIusSMfpk8uXtlfOvpci8fih191mGi7Y+kM2VE+YRTiKN9ASqnk/GpwTwFy0AmINTZbRlN+/AkJMQGAPNaqDB8PJ7G8nYCnpaJJ0MFie/CmT7O9jXCsQazSGh5wAyq5iJVfZzA9CjsHCeWTYGRgDnEmC0KJltNZMwWrSlFyncAMGsbs1YXaLB0Afr89z07FJjpmLzpxkHqwHUncoxDwidVBVB23oqagABKpLskpV+B5ESL2zPLONMKILHl4nRFG8FQAsjybIGAy+IVP4YC08rwGB5EMO34oYbVJPcRQ5O+rVbP6pFbvO19vTKojyXrPn4PJVct8JmtKquJEYKa83v40rda6bWkB8y6l2MBM4Zda7RuO+37DjPQ2LfZ0GLbJr65DDQCphoJv4rkdXNhncw3NwLmyUzl0Ufdgnn0GNTmwX+P9XgyGXcBTgAAAABJRU5ErkJggg==",
      identificador: "Flujo electrico S3",
      tipo: "dependiente",
      valor: 15,
      formula: "\\frac{([v/Carga 1] \\times \\frac{1}{10^{9}})+([v/Carga 2] \\times \\frac{1}{10^{9}})}{8.85 \\times 10^{-12}}",
      exponenteBase10: 0,
      numeroDecimales: 1,
    },
  ]);
  
  

  const [variable, setVariable] = useState({});
  const [processedSource, setProcessedSource] = useState("");
  const [preview, setPreview] = useState(false);
  const editorRef = useRef(null);

  const togglePreview = () => {
    setPreview(!preview);
    // Supongamos que "htmlString" es el string que contiene tu código HTML.
    const htmlString = editorRef.current.getContent();
    // Crear un elemento div para manipular el HTML como un DOM
    const div = document.createElement("div");
    div.innerHTML = htmlString;

    // Obtener todas las etiquetas <img> del HTML
    const imgTags = div.querySelectorAll("img");

    // Recorrer cada etiqueta <img> y realizar la sustitución si es necesario
    imgTags.forEach((imgTag) => {
      const alt = imgTag.getAttribute("alt");

      // Buscar si el valor de "alt" coincide con algún identificador en el array
      const variable = variables.find((varObj) => varObj.identificador === alt);

      if (variable) {
        // Crear una nueva etiqueta con el valor correspondiente
        const newValueNode = document.createTextNode(
          variable.valor +
            (variable.exponenteBase10 !== 0
              ? `\\times10^{${variable.exponenteBase10}}`
              : "")
        );

        // Reemplazar la etiqueta <img> con la nueva etiqueta de valor
        imgTag.parentNode.replaceChild(newValueNode, imgTag);
      }
    });

    // El contenido modificado está ahora en el div
    const modifiedHTML = div.innerHTML;
    processKatexBlocks(modifiedHTML);
  };

  const processKatexBlocks = (text) => {
    console.log(text);
    const processedText = text.replace(/\$\$(.*?)\$\$/g, (match, latex) => {
      try {
        console.log(latex);
        const renderedLatex = katex.renderToString(latex, {
          throwOnError: false,
        });
        return renderedLatex;
      } catch (error) {
        console.error("Error rendering LaTeX:", error);
        return match;
      }
    });
    setProcessedSource(processedText);
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modal1IsOpen, setModal1IsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const openModal = () => {
    setModalIsOpen(false);
  };

  const openModal1 = () => {
    setModal1IsOpen(true);
    closeModal();
  };

  const closeModal1 = () => {
    setModal1IsOpen(false);
    openModal();
  };

  const closeModal = () => {
    setModalIsOpen(true);
  };

  const handleInput = (event) => {
    setInputValue(event.target.value);
  };

  const generateImageBase64 = async (name) => {
    const canvas = document.createElement("canvas");
    const fontSize = 0.9 * 16;
    const context = canvas.getContext("2d");
    const textMetrics = context.measureText(name);
    const textWidth = textMetrics.width * 1.5;
    const textHeight =
      textMetrics.actualBoundingBoxAscent +
      textMetrics.actualBoundingBoxDescent;
    canvas.width = textWidth;
    canvas.height = textHeight + 10;
    context.font = `${fontSize}px Arial`;
    context.textAlign = "center";
    context.fillStyle = "#6e0000";
    context.fillText(
      name,
      canvas.width / 2,
      canvas.height / 2 + textHeight / 2
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result.split(",")[1];
          console.log(base64Data);
          resolve(blob);
        };
        reader.readAsDataURL(blob);
      }, "image/png");
    });
  };

  const handleSave = async () => {
    const imageBase64 = await generateImageBase64(inputValue);
    const newContent = `<img alt="${inputValue}" src="${URL.createObjectURL(
      imageBase64
    )}" style="display: inline-block" />`;
    editorRef.current.setContent(editorRef.current.getContent() + newContent);
    closeModal();
  };

  const handleInsert = async (variable) => {
    const imageBase64 = await generateImageBase64(variable.identificador);
    const newContent = `<img alt="${
      variable.identificador
    }" src="${URL.createObjectURL(
      imageBase64
    )}" style="display: inline-block" />`;
    editorRef.current.setContent(editorRef.current.getContent() + newContent);
    closeModal();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Markdown Editor</h1>
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={openModal}
          >
            Variables
          </button>
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => togglePreview()}
          >
            Vista
          </button>
        </div>
      </div>
      <div className={preview ? "hidden" : ""}>
        <Editor
          apiKey="zxlnczwlrd1e9yntlc2tgyb79nqylkpzakq1wm14indg34xo"
          onEditorChange={(evt, editor) => (editorRef.current = editor)}
          initialValue={textoPeticion}
          init={initialConfig}
        />
      </div>

      <MDEditor.Markdown
        source={processedSource}
        className={preview ? "" : "hidden"}
      />

      {!modalIsOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50">
          <div className="relative w-1/2 h-1/2 bg-white rounded-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Variables</h2>

              <div className="flex gap-2 ml-auto">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                  onClick={() => console.log("Crear")}
                >
                  Crear
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1  rounded-lg"
                  onClick={closeModal}
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Grid of items */}
            <div className="grid grid-cols-2 gap-4 p-4">
              {variables.map((variable) => (
                <div className="border p-4 rounded-lg flex justify-between items-center">
                  <h3 className="text-lg font-md">{variable.identificador}</h3>
                  <div className="flex gap-2 ml-auto">
                    <button
                      className="bg-blue-500 text-white px-2 py-1  rounded-lg"
                      onClick={() => handleInsert(variable)}
                    >
                      Insertar
                    </button>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                      onClick={() => {
                        openModal1();
                        setVariable(variable);
                      }}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modal1IsOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50">
          <div className="relative w-1/2 h-1/2 bg-white rounded-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">{variable.identificador}</h2>

              <div className="flex gap-2 ml-auto">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                  onClick={closeModal1}
                >
                  Guardar
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1  rounded-lg"
                  onClick={closeModal1}
                >
                  Eliminar
                </button>
              </div>
            </div>

            {/* Grid of items */}
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label
                  for="identificador"
                  class="block mb-2 text-sm font-medium text-gray-900"
                >
                  Identificador
                </label>
                <input
                  type="text"
                  name="identificador"
                  id="identificador"
                  value={variable.identificador}
                  onChange={(e) =>
                    setVariable({ ...variable, identificador: e.target.value })
                  }
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Identificador"
                />
              </div>

              <div>
                <label
                  for="tipo"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Tipo
                </label>
                <select
                  id="tipo"
                  value={variable.tipo}
                  onChange={(e) =>
                    setVariable({ ...variable, tipo: e.target.value })
                  }
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  <option value="independiente">Independiente</option>
                  <option value="dependiente">Dependiente</option>
                </select>
              </div>
              <div>
                <label
                  for="exponenteBase10"
                  class="block mb-2 text-sm font-medium text-gray-900"
                >
                  Exponente base 10
                </label>
                <input
                  type="text"
                  name="exponenteBase10"
                  id="exponenteBase10"
                  value={variable.exponenteBase10}
                  onChange={(e) =>
                    setVariable({
                      ...variable,
                      exponenteBase10: e.target.value,
                    })
                  }
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Exponente base 10"
                />
              </div>
              <div>
                <label
                  for="numeroDecimales"
                  class="block mb-2 text-sm font-medium text-gray-900"
                >
                  Número de decimales
                </label>
                <input
                  type="text"
                  name="numeroDecimales"
                  id="numeroDecimales"
                  value={variable.numeroDecimales}
                  onChange={(e) =>
                    setVariable({
                      ...variable,
                      numeroDecimales: e.target.value,
                    })
                  }
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Número de decimales"
                />
              </div>
              <div
                className={variable.tipo === "independiente" ? "" : "hidden"}
              >
                <label
                  for="valorMinimo"
                  class="block mb-2 text-sm font-medium text-gray-900"
                >
                  Valor mínimo
                </label>
                <input
                  type="text"
                  name="valorMinimo"
                  id="valorMinimo"
                  value={variable.valorMinimo}
                  onChange={(e) =>
                    setVariable({ ...variable, valorMinimo: e.target.value })
                  }
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Valor mínimo"
                />
              </div>
              <div
                className={variable.tipo === "independiente" ? "" : "hidden"}
              >
                <label
                  for="valorMaximo"
                  class="block mb-2 text-sm font-medium text-gray-900"
                >
                  Valor máximo
                </label>
                <input
                  type="text"
                  name="valorMaximo"
                  id="valorMaximo"
                  value={variable.valorMaximo}
                  onChange={(e) =>
                    setVariable({ ...variable, valorMaximo: e.target.value })
                  }
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Valor máximo"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);
const initialSource =
    "## Jorge Sanchez\n" +
    "`$$\\pi c_4=[v/nombreVariable]$$` `Latex formula`\n" +
    "> todo: React component preview markdown text. \n" +
    "```js \n" +
    "const jorgeVariable = 0;\n" +
    "```";
'<p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">Las tres esferas peque&ntilde;as que se muestran en la figura 3 tienen cargas&nbsp;<strong>q1</strong> =&nbsp; <span class="variable">variable_1</span>&nbsp;nC,&nbsp;<strong>q2&nbsp;</strong>= - 7.80 nC y&nbsp;<strong>q3</strong> = +2.40&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">nC. El flujo el&eacute;ctrico en $$N*m^2/C$$ a trav&eacute;s de la superficie S3 es:&nbsp;<strong>(0.25)</strong></span></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>&nbsp;<img src="https://i.ibb.co/vHTqk01/Captura-de-pantalla-2023-08-13-013810.png" alt="" width="201" height="179">&nbsp;</strong></span></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>a)</strong> $$\frac{-3.4\times10^{-9}}{Є_0}$$ <strong>b)</strong> $$\frac{-3.4\times10^{-9}}{Є_0}$$ <strong>c)</strong> $$\frac{-5.4\times10^{-9}}{Є_0}$$ <strong>d)</strong> $$\frac{-6.4\times10^{-9}}{Є_0}$$</span></p>'

'<p style="text-align: center;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 12pt;">UNIVERSIDAD DEL NORTE</span></strong></span><br><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 12pt;">DEPARTAMENTO DE FISICA</span></strong></span><br><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 12pt;">I PARCIAL DE FISICA ELECTRICIDAD</span></strong></span></p>
        <p style="text-align: center;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 12pt;">NOMBRE:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;FECHA:</span></strong></span></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>Valoraci&oacute;n:&nbsp;</strong>el examen consta de 3 secciones. La secci&oacute;n I tiene un valor del 25%, la secci&oacute;n II tiene un&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">valor del 25%, La secci&oacute;n III tiene un valor del 50%. La secci&oacute;n I y II Duraci&oacute;n del examen 45 minutos, La&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">secci&oacute;n III Duraci&oacute;n 45 minutos. (Para obtener la m&aacute;xima nota sea claro en sus planteamientos f&iacute;sicos, con&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">buena caligraf&iacute;a y con un adecuado manejo de unidades.)</span></p>
        <p><strong><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">Secci&oacute;n I (Justifique sus respuestas) (valor 1.25)</span></strong></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">1. Usted acerca una barra de caucho cargada negativamente a un conductor conectado a tierra sin tocarlo (figura 1). Luego </span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">desconecta la tierra. .Cual es el signo de la carga sobre el conductor una vez que retira la barra cargada?&nbsp;<strong>(0.25)</strong></span></p>
        <p><img src="https://th.bing.com/th/id/OIP.XqiZrxPDO7vg1qBQGKYuYgHaEo?w=263&amp;h=180&amp;c=7&amp;r=0&amp;o=5&amp;dpr=1.3&amp;pid=1.7" alt="" width="190" height="130"></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>a)&nbsp;</strong>Negativa, porque se transfieren electrones de la tierra al conductor.</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>b)</strong>&nbsp;Positiva, porque se transfieren protones de la tierra al conductor.</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>c)</strong>&nbsp;Positiva, porque se transfieren electrones del conductor a la tierra.</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>d)</strong>&nbsp;Sin carga.</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>e)</strong>&nbsp;No es posible determinarlo a partir de la informaci&oacute;n proporcionada</span></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">2. Coloque dos cargas separadas entre s&iacute; por una distancia r. Luego, cada carga se duplica y la distancia entre las cargas tambi&eacute;n </span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">se duplica. &iquest;C&oacute;mo cambia la fuerza entre las dos cargas?&nbsp;<strong>(0.25)</strong></span></p>
        <p><iframe style="width: 233px; height: 131px;" title="YouTube video player" src="https://www.youtube.com/embed/K5l5rSxB8nY" width="233" height="131" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen"></iframe></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>a)</strong>&nbsp;La nueva fuerza es el doble de grande.</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>b)</strong>&nbsp;La nueva fuerza es la mitad de grande.</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>c)</strong>&nbsp;La nueva fuerza es cuatro veces m&aacute;s grande.</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>d)&nbsp;</strong>La nueva fuerza es cuatro veces m&aacute;s peque&ntilde;a.</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>e)&nbsp;</strong>La nueva fuerza es la misma.</span></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">3. La figura 2 muestra una vista bidimensional de l&iacute;neas de campo el&eacute;ctrico debidas a dos cargas opuestas. En cu&aacute;l de los cinco&nbsp;</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">puntos es mayor la magnitud del campo el&eacute;ctrico y por qu&eacute;?&nbsp;<strong>(0.25)</strong></span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>a)</strong>&nbsp;A.&nbsp;<strong>b)</strong>&nbsp;B.&nbsp;<strong>c)</strong>&nbsp;C&nbsp;<strong>d)</strong>D&nbsp;<strong>e)</strong>E</span></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">4. Se coloca un dipolo el&eacute;ctrico en una regi&oacute;n de campo el&eacute;ctrico uniforme, con el momento dipolar el&eacute;ctrico&nbsp;</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">apuntando en la direcci&oacute;n opuesta al campo el&eacute;ctrico &iquest;El dipolo est&aacute;?&nbsp;<strong>(0.25)</strong></span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>a)</strong>&nbsp;en equilibrio estable.<strong>&nbsp;b)</strong>&nbsp;en equilibrio inestable.<strong>&nbsp;c)&nbsp;</strong>ninguno de los anteriores.</span></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">5. Las tres esferas peque&ntilde;as que se muestran en la figura 3 tienen cargas&nbsp;<strong>q1</strong>&nbsp;= +4.00 nC,&nbsp;<strong>q2&nbsp;</strong>= - 7.80 nC y&nbsp;<strong>q3</strong>&nbsp;= +2.40&nbsp;</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">nC. El flujo el&eacute;ctrico en $$N*m^2/C$$ a trav&eacute;s de la superficie S3 es:&nbsp;<strong>(0.25)&nbsp;</strong><br><strong>a)</strong> $$\frac{-3.4\times10^{-9}}{Є_0}$$<br><strong>b)</strong> $$\frac{-3.4\times10^{-9}}{Є_0}$$<br><strong>c)</strong> $$\frac{-5.4\times10^{-9}}{Є_0}$$<br><strong>d)</strong> $$\frac{-6.4\times10^{-9}}{Є_0}$$</span></p>
        <p><strong><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">Secci&oacute;n II laboratorio (valor1.25)</span></strong></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>a) </strong>Explique c&oacute;mo se realizo el proceso de carga por inducci&oacute;n con las esferas met&aacute;licas, dibuje cada una de las&nbsp;</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">etapas del proceso. Y explique las fuentes de error.</span></p>
        <p><strong><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">Secci&oacute;n III (Valor 2.5)</span></strong></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">1. Un disco delgado con un agujero circular en el centro, llamado corona circular, tiene un radio interior&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">R1 y un radio exterior R2 (figura 4). El disco tiene una densidad superficial de carga uniforme y positiva&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">𝜎 en su superficie.&nbsp;<strong>(valor de todo el punto 1.25)</strong></span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>a)&nbsp;</strong>Determine la carga el&eacute;ctrica total en la corona circular.</span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>b)</strong>&nbsp;La corona circular se encuentra en el plano yz, con su centro en el origen. Para un punto arbitrario en&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">el eje x (el eje de la corona circular), encuentre la magnitud y la direcci&oacute;n del campo el&eacute;ctrico consider&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">puntos arriba y abajo de la corona circular en la figura.</span></p>
        <p><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">2. Una esfera aislante y s&oacute;lida, de radio a, tiene una densidad de carga uniforme 𝜌 y una carga total Q.&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">Colocada en forma conc&eacute;ntrica a esta esfera existe otra esfera hueca, conductora pero descargada, de&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">radios interno y externo b y c, respectivamente, como se observa en la figura 5.&nbsp;<strong>(valor de todo el punto&nbsp;</strong></span><strong><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">1.25)</span></strong><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>a)</strong>&nbsp;Determine la magnitud del campo el&eacute;ctrico en las regiones&nbsp;<strong>𝑟 &lt; 𝑎, 𝑎 &lt; 𝑟 &lt; 𝑏 &lt; 𝑟 &lt; 𝑐, 𝑟 &gt; 𝑐</strong></span><br><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;"><strong>b)&nbsp;</strong>Determine la carga inducida por unidad de superficie en las superficies interna y externa de la esfera&nbsp;</span><span style="font-size: 12pt; font-family: arial, helvetica, sans-serif;">hueca.&nbsp;</span></p>'*/