// -------------------- Global vars --------------------

let statusLine = "";
let newNodeId = 0;
let selectedNode = null;

const downloadLink = document.getElementById("downloadLink");
const fileUpload = document.getElementById("upload");

// statuses
const Status = {
  addingNode: "Klikněte pro přidání uzlu",
  removingNode: "Vyberte uzel pro odstranění",
  addingEdge: "Vyberte dva uzly pro přidání hrany",
  removingEdge: "Vyberte hranu pro odstranění",
  runningArticulation: "Hledání artikulačních bodů",
  runningBridges: "Hledání mostů",
  runningBiconnected: "Hledání 2-souvislých komponentů"
};

// -------------------- Helper functions --------------------

function setStatus(newStatus) {
  statusLine = newStatus;
  document.getElementById("status-line").textContent = newStatus;
}

// -------------------- General cytoscape stuff --------------------
const cy = cytoscape({
  container: document.getElementById('cy'), // The container ID

  style: [ // Style for nodes and edges
    {
      selector: 'node',
      style: {
        'background-color': '#0074D9',
        'label': 'data(id)',
        'color': '#fff',
        'text-valign': 'center',
        'text-outline-width': 2,
        'text-outline-color': '#0074D9'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#ccc'
      }
    }
  ],

  layout: {
    name: "cose"
  }
});

cy.on("tap", function (event) {
  if (event.target !== cy) {
    return;
  }

  if (statusLine === Status.addingNode) {
    while (cy.$("#" + newNodeId.toString()).length !== 0) {
      newNodeId++;
    }
    cy.add({ data: { id: newNodeId.toString() }, position: event.position });
    setStatus("");
  }
});

cy.on("tap", "node", function (event) {
  const node = event.target;
  if (statusLine === Status.removingNode) {
    cy.remove(node);
    setStatus("");
  }
  if (statusLine === Status.addingEdge) {
    if (selectedNode === null || selectedNode === node) {
      selectedNode = node;
    } else {
      cy.add([
        {
          data: { source: selectedNode.id(), target: node.id() }
        }
      ])
      selectedNode = null;
      setStatus("");
    }
  }
});

cy.on("tap", "edge", function (event) {
  const edge = event.target;
  if (statusLine === Status.removingEdge) {
    cy.remove(edge);
    setStatus("");
  }
});

// -------------------- Functions for events  --------------------

function upload() {
  const file = fileUpload.files[0];
  const reader = new FileReader();
  reader.addEventListener("load", function () {
    const parser = new DOMParser();
    const xmlGraph = parser.parseFromString(reader.result, "application/xml");
    const parseError = xmlGraph.querySelector("parsererror");
    if (parseError) {
      alert("Špatný formát nahraného souboru");
      return;
    }

    const root = xmlGraph.activeElement;
    const graph = root.querySelector("graph");
    if (!graph) {
      alert("Špatný formát nahraného souboru")
      return;
    }

    if (graph.attributes["edgedefault"].value !== "undirected") {
      alert("Špatný formát nahraného souboru - aplikace podporuje pouze neorientované grafy")
      return;
    }

    const elements = [];

    for (let elem of graph.children) {
      if (elem.nodeName === "node") {
        elements.push({ data: { id: elem.id } });
      } else if (elem.nodeName === "edge") {
        elements.push({
          data: {
            source: elem.attributes["source"].value,
            target: elem.attributes["target"].value
          }
        })
      } else {
        alert("Špatný formát nahraného souboru");
        return;
      }

      try {
        cy.batch(function () {
          cy.remove("*");
          cy.add(elements);
        });
        rerender();
      } catch (err) {
        alert("Špatné data nahraného souboru - nebylo možné sestavit validní graf");
      }
    }
  });
  reader.readAsText(file);
}

function download() {
  const doc = document.implementation.createDocument(
    "http://graphml.graphdrawing.org/xmlns",
    "graphml"
  );

  doc.documentElement.setAttribute(
    "xmlns:xsi",
    "http://www.w3.org/2001/XMLSchema-instance"
  );
  doc.documentElement.setAttribute(
    "xsi:schemaLocation",
    "http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd"
  );

  const graphElement = doc.createElement("graph");
  graphElement.setAttribute("edgedefault", "undirected");
  doc.documentElement.appendChild(graphElement);

  const elems = cy.elements();
  for (let elem of elems) {
    let newElement = null;
    if (elem.isNode()) {
      newElement = doc.createElement("node");
      newElement.setAttribute("id", elem.id());
    } else if (elem.isEdge()) {
      newElement = doc.createElement("edge");
      newElement.setAttribute("source", elem.source().id());
      newElement.setAttribute("target", elem.target().id());
    }
    if (newElement !== null) {
      graphElement.appendChild(newElement);
    }
  }

  const serializer = new XMLSerializer();
  const output =
    ("<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serializer.serializeToString(doc))
      // for some reason the xmlns attribute gets put into the graph element
      // so it's necessary to remove it manually when it's serialized
      // (removing it with removeAttribute does nothing)
      .replace("graph xmlns=\"\" ", "graph ");
  console.log(output);
  const blob = new Blob([output], { type: "application/xml" });
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "graph.graphml";
  downloadLink.click();
}

function rerender() {
  let layout = cy.layout({ name: "cose" });
  layout.run();
}

function removeAll() {
  cy.remove("*");
  newNodeId = 0;
}

function addNode() {
  setStatus(Status.addingNode)
}

function addEdge() {
  selectedNode = null;
  setStatus(Status.addingEdge);
}

function removeNode() {
  setStatus(Status.removingNode);
}

function removeEdge() {
  setStatus(Status.removingEdge);
}

function removeEdge() {
  setStatus(Status.removingEdge);
}

function startArticulation() {
  setStatus(Status.runningArticulation);
}

function startBridges() {
  setStatus(Status.runningBridges);
  // TODO
}

function startBiconnected() {
  setStatus(Status.runningBiconnected);
  // TODO
}

// -------------------- Event handling --------------------

const eventConfigs = [
  {
    id: "upload",
    event: "change",
    handler: upload,
    shortcut: "u",
    shortcutHandler: () => fileUpload.click()
  },
  {
    id: "download",
    handler: download,
    shortcut: "d"
  },
  {
    id: "clear",
    handler: removeAll,
    shortcut: "R"
  },
  {
    id: "layout",
    handler: rerender,
    shortcut: "r"
  },
  {
    id: "add-node",
    handler: addNode,
    shortcut: "n"
  },
  {
    id: "add-edge",
    handler: addEdge,
    shortcut: "e"
  },
  {
    id: "remove-node",
    handler: removeNode,
    shortcut: "N"
  },
  {
    id: "remove-edge",
    handler: removeEdge,
    shortcut: "E"
  },
  {
    id: "start-articulation",
    handler: startArticulation,
    shortcut: "a"
  },
  {
    id: "start-bridges",
    handler: startBridges,
    shortcut: "b"
  },
  {
    id: "show-biconnected",
    handler: startBiconnected,
    shortcut: "c"
  },
];

for (const config of eventConfigs) {
  const target = document.getElementById(config.id);
  target.addEventListener(config.event ?? "click", config.handler);
  target.setAttribute(
    "title",
    config.tooltip ?? "" + `(${config.shortcut})`
  );
}

document.addEventListener("keydown", (evt) => {
  for (const config of eventConfigs) {
    if (config.shortcut === evt.key) {
      if (config.shortcutHandler) {
        config.shortcutHandler();
      } else {
        config.handler();
      }
    }
  }
});
