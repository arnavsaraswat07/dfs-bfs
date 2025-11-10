let graph = {};
let positions = {};
let traversalSpeed = 500;

document.getElementById('speed').addEventListener('input', (e) => {
  traversalSpeed = parseInt(e.target.value);
  document.getElementById('speed-value').textContent = traversalSpeed;
});

document.getElementById('add-node').addEventListener('click', addNode);
document.getElementById('add-edge').addEventListener('click', addEdge);
document.getElementById('start-bfs').addEventListener('click', startBFS);
document.getElementById('start-dfs').addEventListener('click', startDFS);
document.getElementById('reset-graph').addEventListener('click', resetGraph);
document.getElementById('delete-node').addEventListener('click', deleteNode);

function addNode() {
  const node = document.getElementById('node-input').value.trim();
  if (node && !graph[node]) {
    graph[node] = [];
    const div = document.createElement('div');
    div.className = 'node';
    div.id = node;
    div.textContent = node;

    const x = Math.random() * 550 + 50;
    const y = Math.random() * 350 + 50;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    positions[node] = { x, y };

    document.getElementById('graph').appendChild(div);
  }
  document.getElementById('node-input').value = '';
}

function addEdge() {
  const from = document.getElementById('edge-from').value.trim();
  const to = document.getElementById('edge-to').value.trim();
  if (graph[from] && graph[to]) {
    if (!graph[from].includes(to)) graph[from].push(to);
    drawEdge(from, to);
  }
  document.getElementById('edge-from').value = '';
  document.getElementById('edge-to').value = '';
}

function deleteNode() {
  const node = document.getElementById('delete-node-input').value.trim();
  if (!graph[node]) return alert("Node doesn't exist!");

  const el = document.getElementById(node);
  if (el) el.remove();

  delete graph[node];
  delete positions[node];

  Object.keys(graph).forEach(from => {
    graph[from] = graph[from].filter(to => to !== node);
  });

  document.getElementById('graph-canvas').innerHTML = '';
  Object.keys(graph).forEach(from => {
    graph[from].forEach(to => drawEdge(from, to));
  });

  document.getElementById('delete-node-input').value = '';
}

function drawEdge(from, to) {
  const canvas = document.getElementById('graph-canvas');
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", positions[from].x + 20);
  line.setAttribute("y1", positions[from].y + 20);
  line.setAttribute("x2", positions[to].x + 20);
  line.setAttribute("y2", positions[to].y + 20);
  line.setAttribute("stroke", "#333");
  line.setAttribute("stroke-width", "2");
  canvas.appendChild(line);
}

function highlightNode(node) {
  const el = document.getElementById(node);
  if (el) el.classList.add('visited');
}

function updateStructureDisplay(structure) {
  const display = document.getElementById('structure-display');
  display.innerHTML = '';
  structure.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    display.appendChild(li);
  });
}

async function startBFS() {
  resetGraph();
  const visited = new Set();
  const startNode = Object.keys(graph)[0];
  if (!startNode) return alert("Add at least one node first!");
  const queue = [startNode];
  const traversalOrder = [];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!visited.has(node)) {
      visited.add(node);
      traversalOrder.push(node);
      highlightNode(node);
      updateStructureDisplay(queue);
      await new Promise(r => setTimeout(r, traversalSpeed));
      graph[node].forEach(n => {
        if (!visited.has(n)) queue.push(n);
      });
    }
  }

  document.getElementById('traversal-output').textContent = traversalOrder.join(' → ');
}

async function startDFS() {
  resetGraph();
  const visited = new Set();
  const startNode = Object.keys(graph)[0];
  if (!startNode) return alert("Add at least one node first!");
  const stack = [startNode];
  const traversalOrder = [];

  while (stack.length > 0) {
    const node = stack.pop();
    if (!visited.has(node)) {
      visited.add(node);
      traversalOrder.push(node);
      highlightNode(node);
      updateStructureDisplay(stack);
      await new Promise(r => setTimeout(r, traversalSpeed));
      graph[node].slice().reverse().forEach(n => {
        if (!visited.has(n)) stack.push(n);
      });
    }
  }

  document.getElementById('traversal-output').textContent = traversalOrder.join(' → ');
}

function resetGraph() {
  document.querySelectorAll('.node').forEach(node => {
    node.classList.remove('visited');
  });
  updateStructureDisplay([]);
  document.getElementById('traversal-output').textContent = '';
  document.getElementById('graph-canvas').innerHTML = '';
  Object.keys(graph).forEach(from => {
    graph[from].forEach(to => drawEdge(from, to));
  });
}

document.getElementById('graph').addEventListener('mousedown', function(e) {
  const target = e.target;
  if (!target.classList.contains('node')) return;

  let shiftX = e.clientX - target.getBoundingClientRect().left;
  let shiftY = e.clientY - target.getBoundingClientRect().top;

  function moveAt(pageX, pageY) {
    const container = document.getElementById('graph-container');
    const rect = container.getBoundingClientRect();
    let x = pageX - rect.left - shiftX;
    let y = pageY - rect.top - shiftY;

    x = Math.max(0, Math.min(x, container.offsetWidth - target.offsetWidth));
    y = Math.max(0, Math.min(y, container.offsetHeight - target.offsetHeight));

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    positions[target.id] = { x, y };

    document.getElementById('graph-canvas').innerHTML = '';
    Object.keys(graph).forEach(from => {
      graph[from].forEach(to => drawEdge(from, to));
    });
  }

  function onMouseMove(e) {
    moveAt(e.pageX, e.pageY);
  }

  document.addEventListener('mousemove', onMouseMove);

  target.onmouseup = function() {
    document.removeEventListener('mousemove', onMouseMove);
    target.onmouseup = null;
  };
});
