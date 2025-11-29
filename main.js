// Fake data - named entities with relationships
// In the future, this will be replaced with data from Azure Function endpoint
const graphData = {
    nodes: [
        // People
        { id: 'alice', name: 'Alice Johnson', type: 'person', description: 'Software Engineer specializing in web development' },
        { id: 'bob', name: 'Bob Smith', type: 'person', description: 'Data Scientist and ML researcher' },
        { id: 'carol', name: 'Carol Williams', type: 'person', description: 'Product Manager with 10 years experience' },
        { id: 'david', name: 'David Brown', type: 'person', description: 'UX Designer and frontend specialist' },

        // Organizations
        { id: 'techcorp', name: 'TechCorp Inc.', type: 'organization', description: 'Leading technology company in cloud services' },
        { id: 'innovate', name: 'Innovate Labs', type: 'organization', description: 'Research and development startup' },
        { id: 'university', name: 'Tech University', type: 'organization', description: 'Premier institution for computer science' },

        // Projects
        { id: 'project_alpha', name: 'Project Alpha', type: 'project', description: 'Machine learning pipeline for data analysis' },
        { id: 'project_beta', name: 'Project Beta', type: 'project', description: 'Cloud infrastructure modernization initiative' },
        { id: 'project_gamma', name: 'Project Gamma', type: 'project', description: 'Customer-facing mobile application' },

        // Technologies
        { id: 'react', name: 'React', type: 'technology', description: 'JavaScript library for building user interfaces' },
        { id: 'python', name: 'Python', type: 'technology', description: 'High-level programming language' },
        { id: 'd3', name: 'D3.js', type: 'technology', description: 'Data visualization library' },
        { id: 'azure', name: 'Azure', type: 'technology', description: 'Microsoft cloud computing platform' }
    ],
    links: [
        // People to Organizations
        { source: 'alice', target: 'techcorp', relationship: 'works at' },
        { source: 'bob', target: 'innovate', relationship: 'works at' },
        { source: 'carol', target: 'techcorp', relationship: 'works at' },
        { source: 'david', target: 'innovate', relationship: 'works at' },
        { source: 'bob', target: 'university', relationship: 'alumnus of' },

        // People to Projects
        { source: 'alice', target: 'project_beta', relationship: 'leads' },
        { source: 'bob', target: 'project_alpha', relationship: 'contributes to' },
        { source: 'carol', target: 'project_gamma', relationship: 'manages' },
        { source: 'david', target: 'project_gamma', relationship: 'designs' },

        // Projects to Organizations
        { source: 'project_alpha', target: 'innovate', relationship: 'owned by' },
        { source: 'project_beta', target: 'techcorp', relationship: 'owned by' },
        { source: 'project_gamma', target: 'techcorp', relationship: 'owned by' },

        // Projects to Technologies
        { source: 'project_alpha', target: 'python', relationship: 'uses' },
        { source: 'project_beta', target: 'azure', relationship: 'uses' },
        { source: 'project_gamma', target: 'react', relationship: 'uses' },
        { source: 'alice', target: 'react', relationship: 'expert in' },
        { source: 'alice', target: 'd3', relationship: 'expert in' },
        { source: 'bob', target: 'python', relationship: 'expert in' },
        { source: 'david', target: 'react', relationship: 'expert in' }
    ]
};

// Graph dimensions
const container = document.getElementById('graph-container');
const width = window.innerWidth;
const height = window.innerHeight;

// Create SVG element
const svg = d3.select('#graph-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Create a group for zoom/pan
const g = svg.append('g');

// Define zoom behavior
const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
        g.attr('transform', event.transform);
    });

svg.call(zoom);

// Create force simulation
const simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links)
        .id(d => d.id)
        .distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30));

// Create links
const link = g.append('g')
    .selectAll('line')
    .data(graphData.links)
    .enter()
    .append('line')
    .attr('class', 'link');

// Create nodes
const node = g.append('g')
    .selectAll('g')
    .data(graphData.nodes)
    .enter()
    .append('g')
    .attr('class', d => `node ${d.type}`)
    .call(drag(simulation));

// Add circles to nodes
node.append('circle')
    .attr('r', 20);

// Add labels to nodes
node.append('text')
    .attr('dy', 35)
    .text(d => d.name);

// Tooltip element
const tooltip = d3.select('#tooltip');

// Hover interactions for tooltip
node.on('mouseenter', function(event, d) {
    tooltip
        .html(`<strong>${d.name}</strong><br>${d.type}<br>${d.description}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px')
        .classed('hidden', false);
})
.on('mousemove', function(event) {
    tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px');
})
.on('mouseleave', function() {
    tooltip.classed('hidden', true);
});

// Click interactions for details panel
const detailsPanel = document.getElementById('details-panel');
const detailName = document.getElementById('detail-name');
const detailType = document.getElementById('detail-type');
const detailDescription = document.getElementById('detail-description');
const detailConnections = document.getElementById('detail-connections');
const closeBtn = document.getElementById('close-details');

node.on('click', function(event, d) {
    event.stopPropagation();
    showDetails(d);
});

closeBtn.addEventListener('click', () => {
    detailsPanel.classList.add('hidden');
});

// Close details panel when clicking outside
svg.on('click', () => {
    detailsPanel.classList.add('hidden');
});

// Header panel toggle functionality
const headerPanel = document.getElementById('header-panel');
const toggleHeaderBtn = document.getElementById('toggle-header');

toggleHeaderBtn.addEventListener('click', () => {
    headerPanel.classList.toggle('minimized');
    if (headerPanel.classList.contains('minimized')) {
        toggleHeaderBtn.textContent = '+';
        toggleHeaderBtn.title = 'Expand header';
    } else {
        toggleHeaderBtn.textContent = '−';
        toggleHeaderBtn.title = 'Minimize header';
    }
});

function showDetails(node) {
    detailName.textContent = node.name;
    detailType.textContent = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    detailDescription.textContent = node.description;

    // Find all connections
    const connections = [];
    graphData.links.forEach(link => {
        if (link.source.id === node.id) {
            connections.push({
                name: link.target.name,
                relationship: link.relationship,
                direction: 'to'
            });
        } else if (link.target.id === node.id) {
            connections.push({
                name: link.source.name,
                relationship: link.relationship,
                direction: 'from'
            });
        }
    });

    // Display connections
    if (connections.length > 0) {
        detailConnections.innerHTML = '<h4>Connections</h4><ul>' +
            connections.map(conn => {
                const arrow = conn.direction === 'to' ? '→' : '←';
                return `<li>${arrow} ${conn.relationship} ${conn.name}</li>`;
            }).join('') +
            '</ul>';
    } else {
        detailConnections.innerHTML = '<p>No connections</p>';
    }

    detailsPanel.classList.remove('hidden');
}

// Drag functionality
function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
}

// Update positions on each tick
simulation.on('tick', () => {
    link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    node
        .attr('transform', d => `translate(${d.x},${d.y})`);
});

// Handle window resize
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    svg.attr('width', newWidth).attr('height', newHeight);
    simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
    simulation.alpha(0.3).restart();
});
