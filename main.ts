import {
	ConductionStrategy,
	ConvectionStrategy,
	RadiationStrategy,
	type Material,
	HeatTransferStrategy,
	ThermalComponent,
	HeatTransferEdge,
	ThermalGraph,
	SolarAbsorbtionStrategy,
} from "./classes.ts";

const AMBIENT_TEMPERATURE_KELVIN = 293.15; // [K]

// https://thermtest.com/thermal-resources/materials-database
// emissivity https://www.engineeringtoolbox.com/emissivity-coefficients-d_447.html
// absorptivity https://www.engineeringtoolbox.com/solar-radiation-absorbed-materials-d_1568.html
const copper: Material = {
	name: "Copper",
	thermalConductivity: 397.48, // [W/m·K]
	specificHeat: 385, // [J/kg·K]
	emissivity: 0.03, // [0-1] for radiation calculations
	absorptivity: 0.64,
	density: 8940, // [kg/m³]
};

const water: Material = {
	name: "Water liquid",
	thermalConductivity: 0.60652, // [W/m·K]
	specificHeat: 4181, // [J/kg·K]
	emissivity: 0.95, // [0-1] for radiation calculations
	density: 997.05, // [kg/m³]
};

const air: Material = {
	name: "Air",
	thermalConductivity: 0.025, // [W/m·K]
	specificHeat: 1004, // [J/kg·K]
	density: 1.29, // [kg/m³]
};

const steel: Material = {
	name: "Steel 304",
	thermalConductivity: 14.644, // [W/m·K]
	specificHeat: 502, // [J/kg·K]
	emissivity: 0.85, // weathered
	absorptivity: 0.85, // weathered
	density: 7920, // [kg/m³]
};

// dummy component, do not add to graph, just create edge
const solarRadiationComponent: ThermalComponent = {
	id: "sun",
	material: {} as Material,
	temperature: 5800,
	getHeatCapacity: () => 0,
	log: [],
	volume: 0,
	setTemperature: (temp: number) => {},
	logAsCelcius: true,
};

const solarComponent = new ThermalComponent(
	"solar panel",
	copper,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);
const pipeWaterComponent = new ThermalComponent(
	"pipe water",
	water,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);
const airComponent = new ThermalComponent(
	"air",
	air,
	99999999999,
	AMBIENT_TEMPERATURE_KELVIN,
);
const pipeComponent = new ThermalComponent(
	"pipe",
	steel,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);
const storageTankComponent = new ThermalComponent(
	"storage tank",
	steel,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);
const waterStorageComponent = new ThermalComponent(
	"water storage",
	water,
	5.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

const pipeLength = 10; // [m]
const pipeSurfaceArea = 0.1; // [m²]

const solarRadiationEdge = new HeatTransferEdge(
	solarRadiationComponent,
	solarComponent,
	new SolarAbsorbtionStrategy(1000, 4.0), // 1000 W/m² solar radiation, 1.0 m² surface area
);

const solarToWaterEdge = new HeatTransferEdge(
	solarComponent,
	pipeWaterComponent,
	new ConductionStrategy(1, pipeSurfaceArea),
);

const waterToPipeEdge = new HeatTransferEdge(
	pipeWaterComponent,
	pipeComponent,
	new ConductionStrategy(pipeLength, pipeSurfaceArea),
);

const pipeToAirEdge = new HeatTransferEdge(
	pipeComponent,
	airComponent,
	new ConductionStrategy(pipeLength, pipeSurfaceArea), // TODO: probably wrong value inputs
);

const graph = new ThermalGraph();
// only add nodes which need to be logged
graph.nodes = [solarComponent, pipeWaterComponent, pipeComponent];
graph.edges = [
	solarToWaterEdge,
	solarRadiationEdge,
	waterToPipeEdge,
	pipeToAirEdge,
];

const simulationTimeSeconds = 3600 * 4; // 4 hours
const simulationStepSeconds = 60 * 10; // 10 minutes

for (let t = 0; t < simulationTimeSeconds; t += simulationStepSeconds) {
	// simulate every minute
	graph.simulateStep(simulationStepSeconds, t);
}
graph.writeNodeLogsToCSV();
