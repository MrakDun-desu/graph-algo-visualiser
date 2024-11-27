// -------------------- Global vars --------------------

let statusLine = "";
let newNodeId = 0;
let selectedNode = null;

// statuses
const Status = {
  addingNode: "Klikněte pro přidání uzlu",
  removingNode: "Vyberte uzel pro odstranění",
  addingEdge: "Vyberte dva uzly pro přidání hrany",
  removingEdge: "Vyberte hranu pro odstranění",
  runningArticulation: "Hledání artikulačních bodů",
  runningBridges: "Hledání mostů",
  runningBiconnected: "Hledání 2-souvislých komponentů"
}

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
    cy.add({ data: { id: (newNodeId++).toString() }, position: event.position });
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

function rerender() {
  let layout = cy.layout({ name: "cose" });
  layout.run();
}

// -------------------- Button event listeneres --------------------

document.getElementById("upload").addEventListener("click", function () {
  // TODO
});

document.getElementById("download").addEventListener("click", function () {
  // TODO
});

document.getElementById("clear").addEventListener("click", function () {
  cy.remove("*");
  newNodeId = 0;
});

document.getElementById("layout").addEventListener("click", function () {
  rerender(cy);
});

document.getElementById("add-node").addEventListener("click", function () {
  setStatus(Status.addingNode);
});

document.getElementById("add-edge").addEventListener("click", function () {
  selectedNode = null;
  setStatus(Status.addingEdge);
});

document.getElementById("remove-node").addEventListener("click", function () {
  setStatus(Status.removingNode);
});

document.getElementById("remove-edge").addEventListener("click", function () {
  setStatus(Status.removingEdge);
});

document.getElementById("start-articulation").addEventListener("click", function () {
  setStatus(Status.runningArticulation);
  // TODO
});

document.getElementById("start-bridges").addEventListener("click", function () {
  setStatus(Status.runningBridges);
  // TODO
});

document.getElementById("start-biconnected").addEventListener("click", function () {
  setStatus(Status.runningBiconnected);
  // TODO
});

