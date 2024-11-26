document.addEventListener('DOMContentLoaded', () => {
  const cy = cytoscape({
    container: document.getElementById('cy'), // The container ID

    elements: [ // List of nodes and edges
      { data: { id: 'a' } },
      { data: { id: 'b' } },
      { data: { id: 'c' } },
      { data: { source: 'a', target: 'b' } },
      { data: { source: 'b', target: 'c' } },
      { data: { source: 'c', target: 'a' } }
    ],

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
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle'
        }
      }
    ],
  });
});
