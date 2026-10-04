// Margin convention
const margin = { top: 30, right: 120, bottom: 50, left: 60 };
const width = 850 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Global variable to store raw dataset
let rawData = [];

// Load CSV File
d3.csv("Ex6_TVdata_withStar.csv").then(data => {
  // Parse numeric fields
  rawData = data.map(d => ({
    brand: d.brand,
    model: d.model,
    screenSize: +d.screenSize,
    screenTech: d.screenTech,
    star: +d.star,
    energyConsumption: +d.energyConsumption
  }));

  // Render Charts
  buildHistogram(rawData);
  buildScatterplot(rawData);
  setupFilterEvents();
}).catch(error => {
  console.error("Error loading CSV data:", error);
});

// ==========================================
// Exercise 6.1 & 6.2: Histogram with Filter
// ==========================================
function buildHistogram(data) {
  // Clear existing SVG
  d3.select("#histogram").html("");

  const svg = d3.select("#histogram")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // X Scale (Energy Consumption)
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.energyConsumption) || 2800])
    .range([0, width]);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // X Axis Label
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Labeled Energy Consumption (kWh/year)");

  // Histogram Bin Generator
  const histogram = d3.bin()
    .value(d => d.energyConsumption)
    .domain(x.domain())
    .thresholds(x.ticks(14));

  const bins = histogram(data);

  // Y Scale (Frequency)
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length) || 10])
    .range([height, 0]);

  // Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Y Axis Label
  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .text("Frequency");

  // Render Histogram Bars
  svg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
      .attr("class", "histogram-bar")
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("y", d => y(d.length))
      .attr("height", d => height - y(d.length));
}

// Filter Button Setup
function setupFilterEvents() {
  d3.selectAll(".filter-btn").on("click", function() {
    d3.selectAll(".filter-btn").classed("active", false);
    d3.select(this).classed("active", true);

    const selectedTech = d3.select(this).attr("data-tech");

    let filteredData = rawData;
    if (selectedTech !== "All") {
      filteredData = rawData.filter(d => d.screenTech === selectedTech);
    }

    // Re-draw Histogram with filtered data
    buildHistogram(filteredData);
  });
}

// ==========================================
// Exercise 6.3 & 6.4: Scatterplot with Tooltips
// ==========================================
function buildScatterplot(data) {
  d3.select("#scatterplot").html("");

  const svg = d3.select("#scatterplot")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // X Scale (Star Rating)
  const x = d3.scaleLinear()
    .domain([0, 8.5])
    .range([0, width]);

  // Y Scale (Energy Consumption)
  const y = d3.scaleLinear()
    .domain([0, 2800])
    .range([height, 0]);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Star Rating");

  // Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .text("Labeled Energy Consumption (kWh/year)");

  const tooltip = d3.select("#tooltip");

  // Render Dots
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", d => `dot ${d.screenTech}`)
      .attr("cx", d => x(d.star))
      .attr("cy", d => y(d.energyConsumption))
      .attr("r", 4)
      .on("mouseover", (event, d) => {
        tooltip.classed("hidden", false)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px")
          .html(`
            <strong>${d.brand.toUpperCase()} - ${d.model}</strong><br/>
            Tech: ${d.screenTech} (${d.screenSize}")<br/>
            Star Rating: ${d.star}<br/>
            Energy: <strong>${d.energyConsumption} kWh/year</strong>
          `);
      })
      .attr("r", 4)
      .on("mouseout", () => {
        tooltip.classed("hidden", true);
      });

  // Add Legend
  const legendData = ["LED", "LCD", "OLED"];
  const legend = svg.append("g")
    .attr("transform", `translate(${width + 20}, 20)`);

  legendData.forEach((tech, i) => {
    const legendRow = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    legendRow.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("class", `dot ${tech}`);

    legendRow.append("text")
      .attr("x", 20)
      .attr("y", 10)
      .attr("font-size", "12px")
      .text(tech);
  });
}