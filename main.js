// Azure Function endpoint configuration
const AZURE_FUNCTION_ENDPOINT = 'https://qtyh-ctfndserc5ctbha5.centralus-01.azurewebsites.net/api/GetDimensionsGraph';

// Fake data - fallback for testing
const fallbackGraphData = {
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

// Global variable to hold graph data
let graphData = null;

// Fetch data from Azure Function endpoint
async function fetchGraphData() {
    try {
        console.log('Fetching dimension data from Azure Function...');
        const response = await fetch(AZURE_FUNCTION_ENDPOINT);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Successfully fetched dimension data:', data);

        console.log('Normalized data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching dimension data:', error);
        console.log('Using fallback data instead');
        return fallbackGraphData;
    }
}

// Initialize the graph visualization
function initializeGraph(data) {
    graphData = data;

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

    console.log('links:', graphData.links);
    console.log('nodes:', graphData.nodes);

    // Create force simulation with size-based charge force
    const simulation = d3.forceSimulation(graphData.nodes)
        .force('link', d3.forceLink(graphData.links)
            .id(d => d.id)
            .distance(100))
        .force('charge', d3.forceManyBody().strength(d => {
            if (d.type === 'portal') return -50;  // Very weak force
            if (d.type === 'Huge') return -600;   // Strongest force
            if (d.type === 'Large') return -450;
            if (d.type === 'Medium') return -300;
            if (d.type === 'Small') return -150;  // Weakest dimension force
            return -300; // default
        }))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => {
            if (d.type === 'portal') return 12;
            if (d.type === 'Huge') return 35;
            if (d.type === 'Large') return 30;
            if (d.type === 'Medium') return 25;
            if (d.type === 'Small') return 20;
            return 25; // default
        }));

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

    // Add circles to nodes with size based on dimension size
    node.append('circle')
        .attr('r', d => {
            if (d.type === 'portal') return 8;
            if (d.type === 'Huge') return 30;
            if (d.type === 'Large') return 25;
            if (d.type === 'Medium') return 20;
            if (d.type === 'Small') return 15;
            return 20; // default
        });

    // Add labels to nodes (position based on node size)
    node.append('text')
        .attr('dy', d => {
            if (d.type === 'portal') return 20;
            if (d.type === 'Huge') return 42;
            if (d.type === 'Large') return 37;
            if (d.type === 'Medium') return 32;
            if (d.type === 'Small') return 27;
            return 32; // default
        })
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
}

// Initialize the application
async function init() {
    const data = await fetchGraphData();
    initializeGraph(data);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
