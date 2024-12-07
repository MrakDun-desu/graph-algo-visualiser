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
  runningBiconnected: "Hledání 2-souvislých komponentů",
  algoFinished: "Algoritmus ukončen"
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
        'text-outline-color': '#0074D9',
        'outline-color': 'yellow'
      }
    },
    {
      selector: "node[color]",
      style: {
        'border-width': 'mapData(color, 0, 1, 0, 3px)',
        'border-color': 'mapData(color, 1, 3, white, black)',
      }
    },
    {
      selector: "node[ap]",
      style: {
        'outline-width': 'mapData(ap, 0, 1, 0, 3px)',
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#ccc',
        'line-style': 'solid'
      }
    },
    {
      selector: "edge[bridge]",
      style: {
        'line-style': function (ele) {
          return ele.data("bridge") === 1 ? "dashed" : "solid";
        },
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
  if (currentAlgo !== null) {
    return;
  }
  cy.remove("*");
  newNodeId = 0;
}

function addNode() {
  if (currentAlgo !== null) {
    return;
  }
  setStatus(Status.addingNode)
}

function addEdge() {
  if (currentAlgo !== null) {
    return;
  }
  selectedNode = null;
  setStatus(Status.addingEdge);
}

function removeNode() {
  if (currentAlgo !== null) {
    return;
  }
  setStatus(Status.removingNode);
}

function removeEdge() {
  if (currentAlgo !== null) {
    return;
  }
  setStatus(Status.removingEdge);
}

function startArticulation() {
  setStatus(Status.runningArticulation);
  setCurrentAlgo(articulationPoints);
}

function startBridges() {
  setStatus(Status.runningBridges);
  setCurrentAlgo(bridges);
}

function showBiconnected() {
  // TODO
}

// -------------------- Algorithms ------------------------

const algoStepTime = 200; // how long between automatic steps
let algoVars = {}; // variables that the current algorithm uses
let algoVarsInternal = {};
let currentAlgo = null; // current running algorithm
let algoStep = 0; // which step the algorithm is on
let algoInterval = null; // interval that automatically steps the algorithm

// reused elements
const algoStepsContent = document.querySelector("#algo-steps .content");
const algoVarsContent = document.querySelector("#algo-vars .content");
const animSpeed = document.getElementById("anim-speed");
const playToggle = document.getElementById("toggle-play");

function setAlgoStep(val) {
  if (currentAlgo === null) {
    return;
  }

  algoStep = val;
  algoStepsContent.querySelector(".current")?.classList.remove("current");
  if (algoStepsContent.children.length + 1 >= algoStep) {
    const currentStep = algoStepsContent.children[algoStep];
    currentStep.classList.add("current");
    currentStep.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function rerenderAlgoVars() {
  if (currentAlgo === null) {
    return;
  }

  algoVarsContent.textContent = JSON.stringify(algoVars, null, 3);
}

function execAlgoStep() {
  if (currentAlgo === null) {
    return;
  }

  currentAlgo[algoStep].callback();
  setAlgoStep(algoStep + 1);
  rerenderAlgoVars();
}

function changeAnimSpeed(speed) {
  if (!algoInterval) {
    return;
  }
  clearInterval(algoInterval);
  algoInterval = setInterval(execAlgoStep, algoStepTime / (speed / 100));
}

function setCurrentAlgo(algo) {
  cy.$("*").removeData();
  cy.style().update();
  if (currentAlgo === null && algo !== null) {
    document.querySelector(".container")
      .classList.add("algo-active");
    rerender();
  }

  currentAlgo = algo;
  if (currentAlgo === null) {
    return;
  }
  const steps = document.querySelector("#algo-steps .content");
  const newStepsContent = [];
  for (const step of currentAlgo) {
    const stepDiv = document.createElement("div");
    stepDiv.textContent = step.code;
    newStepsContent.push(stepDiv);
  }
  steps.replaceChildren(...newStepsContent);
  algoVarsInternal = {};
  algoVars = {};
  rerenderAlgoVars();
  setAlgoStep(0);
}

function toggleAlgoControls() {
  const container = document.querySelector(".container");
  const toggle = document.getElementById("toggle-controls");
  if (container.classList.contains("algo-active")) {
    container.classList.remove("algo-active");
    rerender();
    if (currentAlgo === null) {
      setStatus("");
    } else {
      toggle.textContent = "Zobrazit ovládání algoritmu";
      container.classList.add("algo-controls-hidden");
    }
  } else {
    container.classList.remove("algo-controls-hidden");
    container.classList.add("algo-active");
    rerender();
    toggle.textContent = "Skrýt ovládání algoritmu";
  }
}

function toggleAlgoPlay() {
  if (currentAlgo === null) {
    return;
  }

  if (algoInterval === null) {
    algoInterval = setInterval(execAlgoStep, algoStepTime / (animSpeed.valueAsNumber / 100));
    playToggle.children[0].setAttribute("src", "img/media-pause-24.png");
  } else {
    clearInterval(algoInterval);
    playToggle.children[0].setAttribute("src", "img/media-play-24.png");
    algoInterval = null;
  }
}

function algoFinish() {
  clearInterval(algoInterval);
  playToggle.children[0].setAttribute("src", "img/media-play-24.png");
  algoInterval = null;
  while (currentAlgo !== null) {
    execAlgoStep();
  }
}

const articulationPoints = [
  {
    code: "AP(V, Adj):",
    callback: function () { }
  },

  {
    code: "for u in V do:",
    iterator: null,
    collection: null,
    callback: function () {
      if (this.collection === null) {
        this.collection = cy.nodes();
      }
      if (this.iterator === null) {
        this.iterator = 0;
      }
      if (this.iterator >= this.collection.length) {
        this.iterator = null;
        this.collection = null;
        algoVars.u = undefined;
        algoVarsInternal.u = undefined;
        algoStep += 3;
        return;
      }
      algoVars.u = this.collection[this.iterator].id();
      algoVarsInternal.u = this.collection[this.iterator];
      this.iterator++;
    }
  },

  {
    code: "  color[u] = WHITE",
    callback: function () {
      const element = algoVarsInternal.u;
      algoVars.color ??= {};
      algoVars.color[element.id()] = "WHITE";
      element.data("color", 1);
    }
  },

  {
    code: "  p[u] = null",
    callback: function () {
      const element = algoVarsInternal.u;
      algoVars.p ??= {};
      algoVars.p[element.id()] = null;
      element.data("p", null);
    }
  },

  {
    code: "  ap[u] = false",
    callback: function () {
      const element = algoVarsInternal.u;
      algoVars.ap ??= {};
      algoVars.ap[element.id()] = 0;
      algoStep -= 4;
    }
  },

  {
    code: "time = 0",
    callback: function () {
      algoVars.time = 0;
    }
  },

  {
    code: "for u in V do:",
    iterator: null,
    collection: null,
    callback: function () {
      if (this.collection === null) {
        this.collection = cy.nodes();
      }
      if (this.iterator === null) {
        this.iterator = 0;
      }
      if (this.iterator >= this.collection.length) {
        this.iterator = null;
        this.collection = null;
        algoVars.u = undefined;
        algoVarsInternal.u = undefined;
        // end algorithm
        if (algoInterval) {
          clearInterval(algoInterval);
          playToggle.children[0].setAttribute("src", "img/media-play-24.png");
          algoInterval = null;
        }
        currentAlgo = null;
        document.querySelector("#algo-steps .content .current")?.classList.toggle("current");
        setStatus(Status.algoFinished);
        return;
      }
      algoVars.u = this.collection[this.iterator].id();
      algoVarsInternal.u = this.collection[this.iterator];
      this.iterator++;
    }
  },

  {
    code: "  if color[u] == WHITE then:",
    callback: function () {
      if (algoVarsInternal.u.data("color") !== 1) {
        // going back to for since there's nothing else after if
        algoStep -= 2;
      }
    }
  },

  {
    code: "    AP-Visit(u)",
    callback: function () {
      // gotta push to return stack to know where to come back (coming back to for here)
      algoVarsInternal.returns ??= [];
      algoVarsInternal.returns.push(algoStep - 3);
      // no need to push u on stack, only do that when u goes out of scope (not here)
    }
  },

  {
    code: "AP-Visit(u):",
    callback: function () { }
  },

  {
    code: "color[u] = GRAY",
    callback: function () {
      const element = algoVarsInternal.u;
      algoVars.color[element.id()] = "GRAY";
      element.data("color", 2);
    }
  },

  {
    code: "children = 0",
    callback: function () {
      algoVars.children = 0;
      // no need to push children on stack, only do that when it goes out of scope
    }
  },

  {
    code: "d[u] = low[u] = time = time + 1",
    callback: function () {
      algoVars.time += 1;
      const element = algoVarsInternal.u;
      algoVars.d ??= {};
      algoVars.d[element.id()] = algoVars.time;
      algoVars.low ??= {};
      algoVars.low[element.id()] = algoVars.time;
    }
  },

  {
    code: "for v in Adj[u] do:",
    callback: function () {
      algoVarsInternal.collection ??= algoVarsInternal.u.neighborhood("node");
      algoVarsInternal.iterator ??= 0;
      const collection = algoVarsInternal.collection;

      if (algoVarsInternal.iterator >= collection.length) {
        algoVarsInternal.iterator = undefined;
        algoVarsInternal.collection = undefined;
        algoVars.v = undefined;
        algoVarsInternal.v = undefined;
        algoStep += 11;
        return;
      }
      algoVars.v = collection[algoVarsInternal.iterator].id();
      algoVarsInternal.v = collection[algoVarsInternal.iterator];
      algoVarsInternal.iterator++;
    }
  },

  {
    code: "  if color[v] == WHITE then:",
    callback: function () {
      if (algoVarsInternal.v.data("color") !== 1) {
        algoStep += 8;
      }
    }
  },

  {
    code: "    children = children + 1",
    callback: function () {
      algoVars.children++;
    }
  },

  {
    code: "    p[v] = u",
    callback: function () {
      const element = algoVarsInternal.v;
      algoVars.p[element.id()] = algoVarsInternal.u.id();
      element.data("p", algoVarsInternal.u);
    }
  },

  {
    code: "    AP-Visit(v)",
    callback: function () {
      // push all local variables on stack since they're going to change
      algoVarsInternal.uStack ??= [];
      algoVarsInternal.vStack ??= [];
      algoVarsInternal.childrenStack ??= [];
      algoVarsInternal.collectionStack ??= [];
      algoVarsInternal.iteratorStack ??= [];
      algoVarsInternal.uStack.push(algoVarsInternal.u);
      algoVarsInternal.vStack.push(algoVarsInternal.v);
      algoVarsInternal.childrenStack.push(algoVars.children);
      algoVarsInternal.collectionStack.push(algoVarsInternal.collection);
      algoVarsInternal.iteratorStack.push(algoVarsInternal.iterator);
      // unset the variables that go out of scope
      algoVarsInternal.u = algoVarsInternal.v;
      algoVars.u = algoVars.v;
      algoVarsInternal.v = undefined;
      algoVars.v = undefined;
      algoVars.children = undefined;
      algoVarsInternal.collection = undefined;
      algoVarsInternal.iterator = undefined;
      // mark return position (the start of for)
      algoVarsInternal.returns.push(algoStep);
      algoStep -= 9;
    }
  },

  {
    code: "    low[u] = Min(low[u], low[v])",
    callback: function () {
      algoVars.low[algoVarsInternal.u.id()] = Math.min(
        algoVars.low[algoVarsInternal.u.id()],
        algoVars.low[algoVarsInternal.v.id()],
      );
    }
  },

  {
    code: "    if p[u] == null && children > 1 then:",
    callback: function () {
      if (algoVars.p[algoVarsInternal.u.id()] !== null || algoVars.children <= 1) {
        algoStep += 1;
      }
    }
  },

  {
    code: "      ap[u] = true",
    callback: function () {
      algoVars.ap[algoVarsInternal.u.id()] = true;
      algoVarsInternal.u.data("ap", 1);
    }
  },

  {
    code: "    if p[u] != null && low[v] >= d[u] then:",
    callback: function () {
      if (algoVars.p[algoVarsInternal.u.id()] === null ||
        algoVars.low[algoVarsInternal.v.id()] < algoVars.d[algoVarsInternal.u.id()]) {
        algoStep -= 9;
      }
    }
  },

  {
    code: "      ap[u] = true",
    callback: function () {
      algoVars.ap[algoVarsInternal.u.id()] = true;
      algoVarsInternal.u.data("ap", 1);
      algoStep -= 10;
    }
  },

  {
    code: "  else if p[u] != v then:",
    callback: function () {
      if (algoVars.p[algoVarsInternal.u.id()] === algoVarsInternal.v.id()) {
        algoStep -= 11;
      }
    }
  },

  {
    code: "    low[u] = Min(low[u], d[v])",
    callback: function () {
      algoVars.low[algoVarsInternal.u.id()] = Math.min(
        algoVars.low[algoVarsInternal.u.id()],
        algoVars.d[algoVarsInternal.v.id()],
      );
      // back to the start of the for
      algoStep -= 12;
    }
  },

  {
    code: "color[u] = BLACK",
    callback: function () {
      const element = algoVarsInternal.u;
      algoVars.color[element.id()] = "BLACK";
      element.data("color", 3);
      // returning from function here so pop all locals from stack
      algoVarsInternal.v = algoVarsInternal.vStack?.pop();
      algoVarsInternal.u = algoVarsInternal.uStack?.pop();
      algoVarsInternal.collection = algoVarsInternal.collectionStack?.pop();
      algoVarsInternal.iterator = algoVarsInternal.iteratorStack?.pop();
      algoVars.v = algoVarsInternal.v?.id() ?? undefined;
      algoVars.u = algoVarsInternal.u?.id() ?? undefined;
      algoVars.children = algoVarsInternal.childrenStack?.pop() ?? undefined;
      // also return to the step where the return points to
      algoStep = algoVarsInternal.returns.pop();
      // just to clean up, also destroy the stacks if we're returning for last time
      if (algoVarsInternal.returns.length === 0) {
        algoVarsInternal.returns = undefined;
        algoVarsInternal.vStack = undefined;
        algoVarsInternal.uStack = undefined;
        algoVarsInternal.childrenStack = undefined;
        algoVarsInternal.collectionStack = undefined;
        algoVarsInternal.iteratorStack = undefined;
      }
    }
  }
];

const bridges = [
  {
    code: "Bridges(V, Adj):",
    callback: function () { }
  },

  {
    code: "for u in V do:",
    iterator: null,
    collection: null,
    callback: function () {
      if (this.collection === null) {
        this.collection = cy.nodes();
      }
      if (this.iterator === null) {
        this.iterator = 0;
      }
      if (this.iterator >= this.collection.length) {
        this.iterator = null;
        this.collection = null;
        algoVars.u = undefined;
        algoVarsInternal.u = undefined;
        algoStep += 2;
        return;
      }
      algoVars.u = this.collection[this.iterator].id();
      algoVarsInternal.u = this.collection[this.iterator];
      this.iterator++;
    }
  },

  {
    code: "  color[u] = WHITE",
    callback: function () {
      const element = algoVarsInternal.u;
      algoVars.color ??= {};
      algoVars.color[element.id()] = "WHITE";
      element.data("color", 1);
    }
  },

  {
    code: "  p[u] = null",
    callback: function () {
      const element = algoVarsInternal.u;
      algoVars.p ??= {};
      algoVars.p[element.id()] = null;
      element.data("p", null);
      algoStep -= 3;
    }
  },

  {
    code: "time = 0",
    callback: function () {
      algoVars.time = 0;
    }
  },

  {
    code: "for u in V do:",
    iterator: null,
    collection: null,
    callback: function () {
      if (this.collection === null) {
        this.collection = cy.nodes();
      }
      if (this.iterator === null) {
        this.iterator = 0;
      }
      if (this.iterator >= this.collection.length) {
        this.iterator = null;
        this.collection = null;
        algoVars.u = undefined;
        algoVarsInternal.u = undefined;
        // end algorithm
        if (algoInterval) {
          clearInterval(algoInterval);
          playToggle.children[0].setAttribute("src", "img/media-play-24.png");
          algoInterval = null;
        }
        currentAlgo = null;
        document.querySelector("#algo-steps .content .current")?.classList.toggle("current");
        setStatus(Status.algoFinished);
        return;
      }
      algoVars.u = this.collection[this.iterator].id();
      algoVarsInternal.u = this.collection[this.iterator];
      this.iterator++;
    }
  },

  {
    code: "  if color[u] == WHITE then:",
    callback: function () {
      if (algoVarsInternal.u.data("color") !== 1) {
        // going back to for since there's nothing else after if
        algoStep -= 2;
      }
    }
  },

  {
    code: "    Bridge-Visit(u)",
    callback: function () {
      // gotta push to return stack to know where to come back (coming back to for here)
      algoVarsInternal.returns ??= [];
      algoVarsInternal.returns.push(algoStep - 3);
      // no need to push u on stack, only do that when u goes out of scope (not here)
    }
  },

  {
    code: "Bridge-Visit(u):",
    callback: function () { }
  },

  {
    code: "color[u] = GRAY",
    callback: function () {
      const element = algoVarsInternal.u;
      algoVars.color[element.id()] = "GRAY";
      element.data("color", 2);
    }
  },

  {
    code: "d[u] = low[u] = time = time + 1",
    callback: function () {
      algoVars.time += 1;
      const element = algoVarsInternal.u;
      algoVars.d ??= {};
      algoVars.d[element.id()] = algoVars.time;
      algoVars.low ??= {};
      algoVars.low[element.id()] = algoVars.time;
    }
  },

  {
    code: "for v in Adj[u] do:",
    callback: function () {
      algoVarsInternal.collection ??= algoVarsInternal.u.neighborhood("node");
      algoVarsInternal.iterator ??= 0;
      const collection = algoVarsInternal.collection;

      if (algoVarsInternal.iterator >= collection.length) {
        algoVarsInternal.iterator = undefined;
        algoVarsInternal.collection = undefined;
        algoVars.v = undefined;
        algoVarsInternal.v = undefined;
        algoStep += 8;
        return;
      }
      algoVars.v = collection[algoVarsInternal.iterator].id();
      algoVarsInternal.v = collection[algoVarsInternal.iterator];
      algoVarsInternal.iterator++;
    }
  },

  {
    code: "  if color[v] == WHITE then:",
    callback: function () {
      if (algoVarsInternal.v.data("color") !== 1) {
        algoStep += 5;
      }
    }
  },

  {
    code: "    p[v] = u",
    callback: function () {
      const element = algoVarsInternal.v;
      algoVars.p[element.id()] = algoVarsInternal.u.id();
      element.data("p", algoVarsInternal.u);
    }
  },

  {
    code: "    Bridge-Visit(v)",
    callback: function () {
      // push all local variables on stack since they're going to change
      algoVarsInternal.uStack ??= [];
      algoVarsInternal.vStack ??= [];
      algoVarsInternal.collectionStack ??= [];
      algoVarsInternal.iteratorStack ??= [];
      algoVarsInternal.uStack.push(algoVarsInternal.u);
      algoVarsInternal.vStack.push(algoVarsInternal.v);
      algoVarsInternal.collectionStack.push(algoVarsInternal.collection);
      algoVarsInternal.iteratorStack.push(algoVarsInternal.iterator);
      // unset the variables that go out of scope
      algoVarsInternal.u = algoVarsInternal.v;
      algoVars.u = algoVars.v;
      algoVarsInternal.v = undefined;
      algoVars.v = undefined;
      algoVars.children = undefined;
      algoVarsInternal.collection = undefined;
      algoVarsInternal.iterator = undefined;
      // mark return position (the start of for)
      algoVarsInternal.returns.push(algoStep);
      algoStep -= 7;
    }
  },

  {
    code: "    low[u] = Min(low[u], low[v])",
    callback: function () {
      algoVars.low[algoVarsInternal.u.id()] = Math.min(
        algoVars.low[algoVarsInternal.u.id()],
        algoVars.low[algoVarsInternal.v.id()],
      );
    }
  },

  {
    code: "    if low[v] > d[u] then:",
    callback: function () {
      if (algoVars.low[algoVarsInternal.v.id()] <= algoVars.d[algoVarsInternal.u.id()]) {
        algoStep -= 6;
      }
    }
  },

  {
    code: "      bridges.add((u,v))",
    callback: function () {
      algoVars.bridges ??= [];
      algoVars.bridges.push(`(${algoVarsInternal.u.id()}, ${algoVarsInternal.v.id()})`);
      cy.edges(`[source = "${algoVarsInternal.u.id()}"][target = "${algoVarsInternal.v.id()}"]`)
        .data("bridge", 1);
      cy.edges(`[target = "${algoVarsInternal.u.id()}"][source = "${algoVarsInternal.v.id()}"]`)
        .data("bridge", 1);
      algoStep -= 7;
    }
  },

  {
    code: "  else if p[u] != v then:",
    callback: function () {
      if (algoVars.p[algoVarsInternal.u.id()] == algoVarsInternal.v.id()) {
        algoStep -= 8;
      }
    }
  },

  {
    code: "    low[u] = Min(low[u], d[v])",
    callback: function () {
      algoStep -= 9;
      algoVars.low[algoVarsInternal.u.id()] = Math.min(
        algoVars.low[algoVarsInternal.u.id()],
        algoVars.d[algoVarsInternal.v.id()]
      );
    }
  },

  {
    code: "color[u] = BLACK",
    callback: function () {
      const element = algoVarsInternal.u;
      algoVars.color[element.id()] = "BLACK";
      element.data("color", 3);
      // returning from function here so pop all locals from stack
      algoVarsInternal.v = algoVarsInternal.vStack?.pop();
      algoVarsInternal.u = algoVarsInternal.uStack?.pop();
      algoVarsInternal.collection = algoVarsInternal.collectionStack?.pop();
      algoVarsInternal.iterator = algoVarsInternal.iteratorStack?.pop();
      algoVars.v = algoVarsInternal.v?.id() ?? undefined;
      algoVars.u = algoVarsInternal.u?.id() ?? undefined;
      // also return to the step where the return points to
      algoStep = algoVarsInternal.returns.pop();
      // just to clean up, also destroy the stacks if we're returning for last time
      if (algoVarsInternal.returns.length === 0) {
        algoVarsInternal.returns = undefined;
        algoVarsInternal.vStack = undefined;
        algoVarsInternal.uStack = undefined;
        algoVarsInternal.collectionStack = undefined;
        algoVarsInternal.iteratorStack = undefined;
      }
    }
  }
];

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
    handler: showBiconnected,
    shortcut: "c"
  },
  {
    id: "toggle-play",
    handler: toggleAlgoPlay,
    shortcut: " ",
    tooltip: "Spustit/pozastavit algoritmus "
  },
  {
    id: "algo-step",
    handler: execAlgoStep,
    shortcut: "s",
    tooltip: "Krok algoritmu "
  },
  {
    id: "algo-finish",
    handler: algoFinish,
    tooltip: "Ukončit algoritmus"
  },
  {
    id: "anim-speed",
    event: "change",
    handler: (evt) => changeAnimSpeed(evt.target.valueAsNumber)
  },
  {
    id: "toggle-controls",
    handler: toggleAlgoControls,
    shortcut: "Escape"
  }
];

for (const config of eventConfigs) {
  const target = document.getElementById(config.id);
  target.addEventListener(config.event ?? "click", config.handler);
  if (config.shortcut) {
    target.setAttribute(
      "title",
      (config.tooltip ?? "") + `(${config.shortcut})`
    );
  } else {
    target.setAttribute("title", config.tooltip ?? "");
  }
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

